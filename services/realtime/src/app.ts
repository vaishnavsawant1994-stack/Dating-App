import websocket from '@fastify/websocket';
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { AUTH_PROTOCOL_PREFIX, REALTIME_PROTOCOL, containsForbiddenCredentialQuery, parseRealtimeProtocols } from './auth.js';
import { parseClientEnvelope, PROTOCOL_VERSION, type ErrorEnvelope, type ServerEnvelope } from './protocol.js';
import { FixedWindowRateLimiter } from './rate-limiter.js';
import { ConnectionRegistry } from './registry.js';
import { type RealtimeConfig, type RealtimeDependencies, type RealtimePrincipal } from './types.js';

const AUTH_FAILURE = { error: { code: 'REALTIME_UNAUTHORIZED', message: 'Realtime authentication failed.' } } as const;
const ORIGIN_FAILURE = { error: { code: 'REALTIME_ORIGIN_DENIED', message: 'Realtime origin is not allowed.' } } as const;
const CREDENTIAL_QUERY_FAILURE = { error: { code: 'REALTIME_QUERY_CREDENTIAL_DENIED', message: 'Credentials must not be sent in the realtime URL.' } } as const;

interface AuthenticatedRequestContext {
  readonly principal: RealtimePrincipal;
}

function requestOrigin(request: FastifyRequest): string | undefined {
  const value = request.headers.origin;
  return typeof value === 'string' ? value : undefined;
}

function requestId(request: FastifyRequest): string {
  return typeof request.id === 'string' ? request.id : String(request.id);
}

async function reject(reply: FastifyReply, statusCode: number, payload: unknown): Promise<void> {
  await reply.code(statusCode).send(payload);
}

function encodeEnvelope(envelope: ServerEnvelope): string {
  return JSON.stringify(envelope);
}

export async function buildRealtimeApp(
  config: RealtimeConfig,
  dependencies: RealtimeDependencies,
): Promise<FastifyInstance> {
  const createConnectionId = dependencies.createConnectionId ?? randomUUID;
  const now = dependencies.now ?? (() => new Date());
  const requestPrincipals = new WeakMap<FastifyRequest, AuthenticatedRequestContext>();
  const registry = new ConnectionRegistry();

  const app = Fastify({
    logger: config.logging
      ? {
          level: config.logLevel,
          base: { service: config.serviceName, environment: config.environment },
          redact: {
            paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.sec-websocket-protocol'],
            censor: '[REDACTED]',
          },
        }
      : false,
    genReqId: (request) => {
      const supplied = request.headers['x-request-id'];
      return typeof supplied === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(supplied) ? supplied : randomUUID();
    },
  });

  await app.register(websocket, {
    options: {
      maxPayload: config.maxPayloadBytes,
      perMessageDeflate: false,
      handleProtocols: (protocols) => (protocols.has(REALTIME_PROTOCOL) ? REALTIME_PROTOCOL : false),
    },
  });

  app.get('/health/live', async () => ({ status: 'ok', service: config.serviceName }));
  app.get('/health/ready', async (_request, reply) => {
    if (!dependencies.tokenVerifier.isReady()) {
      return reply.code(503).send({ status: 'not_ready', dependency: 'authentication' });
    }
    return { status: 'ready', service: config.serviceName, connections: registry.count() };
  });

  app.route({
    method: 'GET',
    url: '/v1/realtime',
    preValidation: async (request, reply) => {
      if (containsForbiddenCredentialQuery(request.url)) {
        await reject(reply, 400, CREDENTIAL_QUERY_FAILURE);
        return;
      }

      const origin = requestOrigin(request);
      if (origin !== undefined && !config.allowedOrigins.has(origin)) {
        await reject(reply, 403, ORIGIN_FAILURE);
        return;
      }

      const protocolHeader = request.headers['sec-websocket-protocol'];
      const parsedProtocols = parseRealtimeProtocols(typeof protocolHeader === 'string' ? protocolHeader : undefined);
      if (parsedProtocols === null) {
        await reject(reply, 401, AUTH_FAILURE);
        return;
      }

      const principal = await dependencies.tokenVerifier.verify(parsedProtocols.token, {
        requestId: requestId(request),
        ...(origin === undefined ? {} : { origin }),
        remoteAddress: request.ip,
      });
      if (principal === null) {
        await reject(reply, 401, AUTH_FAILURE);
        return;
      }

      requestPrincipals.set(request, { principal });
    },
    handler: async (_request, reply) => reply.code(426).send({
      error: {
        code: 'UPGRADE_REQUIRED',
        message: 'Use a WebSocket upgrade with the together realtime protocol.',
        protocol: REALTIME_PROTOCOL,
        auth_protocol_prefix: AUTH_PROTOCOL_PREFIX,
      },
    }),
    wsHandler: (socket, request) => {
      const authenticated = requestPrincipals.get(request);
      requestPrincipals.delete(request);
      if (authenticated === undefined) {
        socket.close(1008, 'authentication required');
        return;
      }

      const connectionId = createConnectionId();
      const record = {
        connectionId,
        principal: authenticated.principal,
        socket,
        initialized: false,
        alive: true,
      };
      registry.add(record);

      const limiter = new FixedWindowRateLimiter(config.maxMessagesPerWindow, config.rateWindowMs, Date.now());
      record.helloTimer = setTimeout(() => {
        if (!record.initialized && socket.readyState === socket.OPEN) {
          socket.close(1008, 'client hello required');
        }
      }, config.helloTimeoutMs);
      record.helloTimer.unref();

      socket.on('pong', () => {
        record.alive = true;
      });

      socket.on('close', () => {
        registry.delete(connectionId);
      });

      socket.on('error', () => {
        registry.delete(connectionId);
      });

      socket.on('message', (data, isBinary) => {
        if (!limiter.allow(Date.now())) {
          const error: ErrorEnvelope = {
            v: PROTOCOL_VERSION,
            id: createConnectionId(),
            type: 'error',
            payload: {
              code: 'RATE_LIMITED',
              message: 'Realtime message rate exceeded.',
              retryable: true,
            },
          };
          if (socket.bufferedAmount <= config.maxBufferedBytes) {
            socket.send(encodeEnvelope(error));
          }
          socket.close(1008, 'rate limited');
          return;
        }

        if (isBinary) {
          socket.close(1003, 'text messages only');
          return;
        }

        if (socket.bufferedAmount > config.maxBufferedBytes) {
          socket.close(1013, 'backpressure');
          return;
        }

        const message = parseClientEnvelope(data.toString());
        if (message === null) {
          const error: ErrorEnvelope = {
            v: PROTOCOL_VERSION,
            id: createConnectionId(),
            type: 'error',
            payload: {
              code: 'INVALID_ENVELOPE',
              message: 'Realtime message does not match the versioned protocol.',
              retryable: false,
            },
          };
          socket.send(encodeEnvelope(error));
          return;
        }

        if (!record.initialized) {
          if (message.type !== 'client.hello') {
            const error: ErrorEnvelope = {
              v: PROTOCOL_VERSION,
              id: createConnectionId(),
              type: 'error',
              payload: {
                code: 'HELLO_REQUIRED',
                message: 'client.hello must be the first realtime message.',
                reply_to: message.id,
                retryable: true,
              },
            };
            socket.send(encodeEnvelope(error));
            return;
          }

          record.initialized = true;
          if (record.helloTimer !== undefined) {
            clearTimeout(record.helloTimer);
            record.helloTimer = undefined;
          }
          socket.send(encodeEnvelope({
            v: PROTOCOL_VERSION,
            id: createConnectionId(),
            type: 'connection.ready',
            payload: {
              connection_id: connectionId,
              heartbeat_ms: config.heartbeatMs,
              max_payload_bytes: config.maxPayloadBytes,
              server_time: now().toISOString(),
            },
          }));
          return;
        }

        if (message.type === 'client.hello') {
          const error: ErrorEnvelope = {
            v: PROTOCOL_VERSION,
            id: createConnectionId(),
            type: 'error',
            payload: {
              code: 'ALREADY_INITIALIZED',
              message: 'client.hello may only be sent once per connection.',
              reply_to: message.id,
              retryable: false,
            },
          };
          socket.send(encodeEnvelope(error));
          return;
        }

        if (message.type === 'client.ping') {
          socket.send(encodeEnvelope({
            v: PROTOCOL_VERSION,
            id: createConnectionId(),
            type: 'server.pong',
            payload: {
              reply_to: message.id,
              ...(message.payload.nonce === undefined ? {} : { nonce: message.payload.nonce }),
              server_time: now().toISOString(),
            },
          }));
          return;
        }

        const exhaustive: never = message;
        void exhaustive;
      });
    },
  });

  const heartbeatTimer = setInterval(() => registry.heartbeat(), config.heartbeatMs);
  heartbeatTimer.unref();

  app.addHook('onClose', async () => {
    clearInterval(heartbeatTimer);
    registry.closeAll(1012, 'service restart');
  });

  return app;
}
