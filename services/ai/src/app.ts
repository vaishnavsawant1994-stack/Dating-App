import Fastify, { type FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { aiRequestSchema, requestInputCharacters } from './contracts.js';
import { type AiProvider } from './provider.js';
import { type AiAccessAuthorizer, type AiConfig } from './types.js';

interface AiAppDependencies {
  readonly provider: AiProvider;
  readonly authorizer: AiAccessAuthorizer;
  readonly createRequestId?: () => string;
}

export async function buildAiApp(config: AiConfig, dependencies: AiAppDependencies): Promise<FastifyInstance> {
  const createRequestId = dependencies.createRequestId ?? randomUUID;
  const app = Fastify({
    bodyLimit: config.bodyLimitBytes,
    logger: config.logging
      ? {
          level: config.logLevel,
          base: { service: config.serviceName, environment: config.environment },
          redact: {
            paths: ['req.headers.authorization', 'req.headers.cookie'],
            censor: '[REDACTED]',
          },
        }
      : false,
  });

  app.get('/health/live', async () => ({ status: 'ok', service: config.serviceName }));
  app.get('/health/ready', async (_request, reply) => {
    if (!dependencies.authorizer.isReady()) {
      return reply.code(503).send({ status: 'not_ready', dependency: 'authorization' });
    }
    if (!dependencies.provider.isReady()) {
      return reply.code(503).send({ status: 'not_ready', dependency: 'provider' });
    }
    return { status: 'ready', service: config.serviceName, provider: dependencies.provider.name };
  });

  app.post('/v1/ai/execute', async (request, reply) => {
    const requestId = createRequestId();
    const parsed = aiRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: { code: 'INVALID_AI_REQUEST', message: 'AI request does not match the service contract.', request_id: requestId },
      });
    }

    if (requestInputCharacters(parsed.data) > config.maxInputChars) {
      return reply.code(413).send({
        error: { code: 'AI_INPUT_TOO_LARGE', message: 'AI input exceeds the configured limit.', request_id: requestId },
      });
    }

    if (parsed.data.operation === 'generate' && (parsed.data.payload.max_output_tokens ?? config.maxOutputTokens) > config.maxOutputTokens) {
      return reply.code(400).send({
        error: { code: 'AI_OUTPUT_LIMIT_EXCEEDED', message: 'Requested output exceeds the configured limit.', request_id: requestId },
      });
    }

    const allowed = await dependencies.authorizer.authorize({
      requestId,
      remoteAddress: request.ip,
      purpose: parsed.data.purpose,
    });
    if (!allowed) {
      return reply.code(403).send({
        error: { code: 'AI_ACCESS_DENIED', message: 'AI service access is not authorized.', request_id: requestId },
      });
    }

    if (!dependencies.provider.isReady()) {
      return reply.code(503).send({
        error: { code: 'AI_PROVIDER_UNAVAILABLE', message: 'AI provider is unavailable.', request_id: requestId },
      });
    }

    const output = await dependencies.provider.execute(parsed.data);
    return reply.send({
      request_id: requestId,
      operation: parsed.data.operation,
      provider: dependencies.provider.name,
      synthetic: dependencies.provider.synthetic,
      result: output.result,
    });
  });

  return app;
}
