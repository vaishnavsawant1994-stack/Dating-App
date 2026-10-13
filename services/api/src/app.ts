import helmet from '@fastify/helmet';
import { pinoRedactionPaths, REDACTED_VALUE } from '@together/observability';
import { createSecureId } from '@together/security';
import Fastify, { type FastifyInstance } from 'fastify';
import { registerErrorHandling } from './middleware/error-handler.js';
import { registerRequestContext, validOrGeneratedRequestId } from './middleware/request-context.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerSystemRoutes } from './routes/system.js';
import { type ApiApplicationConfig, type ApiDependencies } from './types.js';

export async function buildApiApp(
  config: ApiApplicationConfig,
  dependencies: ApiDependencies,
): Promise<FastifyInstance> {
  const app = Fastify({
    bodyLimit: config.bodyLimitBytes,
    genReqId: (request) =>
      validOrGeneratedRequestId(
        typeof request.headers['x-request-id'] === 'string' ? request.headers['x-request-id'] : undefined,
        createSecureId,
      ),
    logger: config.logging
      ? {
          level: config.logLevel,
          base: { service: config.serviceName, environment: config.environment },
          redact: { paths: [...pinoRedactionPaths], censor: REDACTED_VALUE },
        }
      : false,
  });

  await app.register(helmet, {
    global: true,
    hsts: config.environment === 'production' ? { maxAge: 31_536_000, includeSubDomains: true } : false,
  });

  registerRequestContext(app);
  registerErrorHandling(app);
  registerHealthRoutes(app, config, dependencies);
  registerSystemRoutes(app, config);

  return app;
}
