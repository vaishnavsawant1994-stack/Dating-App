import { describe, expect, it } from 'vitest';
import { encodeAuthProtocol, REALTIME_PROTOCOL } from '../src/auth.js';
import { buildRealtimeApp } from '../src/app.js';
import { type ServerEnvelope } from '../src/protocol.js';
import { type RealtimeConfig, type RealtimeTokenVerifier } from '../src/types.js';

const config: RealtimeConfig = {
  environment: 'test',
  serviceName: 'realtime',
  host: '127.0.0.1',
  port: 0,
  logging: false,
  logLevel: 'error',
  allowedOrigins: new Set(['http://localhost:3000']),
  maxPayloadBytes: 32_768,
  maxBufferedBytes: 524_288,
  heartbeatMs: 30_000,
  helloTimeoutMs: 5_000,
  rateWindowMs: 10_000,
  maxMessagesPerWindow: 100,
};

const verifier: RealtimeTokenVerifier = {
  isReady: () => true,
  verify: async (token) => token === 'valid-token' ? { userId: 'user-1', sessionId: 'session-1' } : null,
};

function nextMessage(socket: { once(event: 'message', listener: (data: Buffer) => void): unknown }): Promise<ServerEnvelope> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timed out waiting for realtime message.')), 2_000);
    socket.once('message', (data) => {
      clearTimeout(timeout);
      resolve(JSON.parse(data.toString()) as ServerEnvelope);
    });
  });
}

function authHeaders(origin = 'http://localhost:3000') {
  return {
    origin,
    'sec-websocket-protocol': `${REALTIME_PROTOCOL}, ${encodeAuthProtocol('valid-token')}`,
  };
}

describe('realtime application', () => {
  it('reports liveness and authentication-backed readiness separately', async () => {
    const app = await buildRealtimeApp(config, { tokenVerifier: verifier, createConnectionId: () => 'connection-0001' });
    await app.ready();

    const live = await app.inject({ method: 'GET', url: '/health/live' });
    const ready = await app.inject({ method: 'GET', url: '/health/ready' });

    expect(live.statusCode).toBe(200);
    expect(ready.statusCode).toBe(200);
    expect(ready.json()).toMatchObject({ status: 'ready', connections: 0 });
    await app.close();
  });

  it('fails readiness closed when the authentication verifier is unavailable', async () => {
    const app = await buildRealtimeApp(config, {
      tokenVerifier: { isReady: () => false, verify: async () => null },
    });
    await app.ready();

    const ready = await app.inject({ method: 'GET', url: '/health/ready' });
    expect(ready.statusCode).toBe(503);
    expect(ready.json()).toEqual({ status: 'not_ready', dependency: 'authentication' });
    await app.close();
  });

  it('requires hello before normal realtime traffic and then answers ping', async () => {
    let sequence = 0;
    const app = await buildRealtimeApp(config, {
      tokenVerifier: verifier,
      createConnectionId: () => `server-event-${String(++sequence).padStart(4, '0')}`,
      now: () => new Date('2026-10-14T00:00:00.000Z'),
    });
    await app.ready();

    const socket = await app.injectWS('/v1/realtime', { headers: authHeaders() });

    const helloRequiredPromise = nextMessage(socket);
    socket.send(JSON.stringify({ v: 1, id: 'message-0001', type: 'client.ping', payload: { nonce: 'before' } }));
    const helloRequired = await helloRequiredPromise;
    expect(helloRequired.type).toBe('error');
    if (helloRequired.type === 'error') {
      expect(helloRequired.payload.code).toBe('HELLO_REQUIRED');
    }

    const readyPromise = nextMessage(socket);
    socket.send(JSON.stringify({ v: 1, id: 'message-0002', type: 'client.hello', payload: { client: 'test', client_version: '0.0.0' } }));
    const ready = await readyPromise;
    expect(ready.type).toBe('connection.ready');

    const pongPromise = nextMessage(socket);
    socket.send(JSON.stringify({ v: 1, id: 'message-0003', type: 'client.ping', payload: { nonce: 'after' } }));
    const pong = await pongPromise;
    expect(pong.type).toBe('server.pong');
    if (pong.type === 'server.pong') {
      expect(pong.payload).toMatchObject({ reply_to: 'message-0003', nonce: 'after' });
    }

    socket.terminate();
    await app.close();
  });

  it('rejects invalid credentials, disallowed origins, and query-string credentials before upgrade', async () => {
    const app = await buildRealtimeApp(config, { tokenVerifier: verifier });
    await app.ready();

    await expect(app.injectWS('/v1/realtime', {
      headers: {
        origin: 'http://localhost:3000',
        'sec-websocket-protocol': `${REALTIME_PROTOCOL}, ${encodeAuthProtocol('wrong-token')}`,
      },
    })).rejects.toThrow();

    await expect(app.injectWS('/v1/realtime', { headers: authHeaders('https://evil.example') })).rejects.toThrow();
    await expect(app.injectWS('/v1/realtime?token=secret', { headers: authHeaders() })).rejects.toThrow();

    await app.close();
  });
});
