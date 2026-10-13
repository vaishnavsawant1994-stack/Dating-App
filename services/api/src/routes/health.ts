import { type ApiErrorEnvelope, type HealthResponse } from '@together/contracts';
import { type FastifyInstance } from 'fastify';
import { type ApiApplicationConfig, type ApiDependencies } from '../types.js';

function health(config: ApiApplicationConfig, status: 'ok' | 'degraded' = 'ok'): HealthResponse {
  return {
    status,
    service: config.serviceName,
    version: config.buildId,
    environment: config.environment,
  };
}

export function registerHealthRoutes(
  app: FastifyInstance,
  config: ApiApplicationConfig,
  dependencies: ApiDependencies,
): void {
  app.get('/health/live', async () => health(config));

  app.get('/health/ready', async (request, reply) => {
    const database = await dependencies.checkDatabaseHealth();
    if (!database.ok) {
      const body: ApiErrorEnvelope = {
        error: {
          code: 'TEMPORARILY_UNAVAILABLE',
          message: 'A required dependency is unavailable.',
          request_id: request.id,
          retryable: true,
        },
      };
      return reply.code(503).send(body);
    }
    return health(config);
  });
}
