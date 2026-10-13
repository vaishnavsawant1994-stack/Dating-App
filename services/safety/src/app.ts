import Fastify, { type FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { SAFETY_CONTRACT_VERSION, submitSafetyReportSchema } from './contracts.js';
import { type SafetyAccessAuthorizer, type SafetyConfig, type SafetyReportStore } from './types.js';

interface SafetyAppDependencies {
  readonly authorizer: SafetyAccessAuthorizer;
  readonly store: SafetyReportStore;
  readonly createId?: () => string;
  readonly now?: () => Date;
}

export async function buildSafetyApp(config: SafetyConfig, dependencies: SafetyAppDependencies): Promise<FastifyInstance> {
  const createId = dependencies.createId ?? randomUUID;
  const now = dependencies.now ?? (() => new Date());
  const app = Fastify({
    bodyLimit: config.bodyLimitBytes,
    logger: config.logging
      ? {
          level: config.logLevel,
          base: { service: config.serviceName, environment: config.environment },
          redact: {
            paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body'],
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
    if (!(await dependencies.store.isReady())) {
      return reply.code(503).send({ status: 'not_ready', dependency: 'report_store' });
    }
    return { status: 'ready', service: config.serviceName, store: dependencies.store.name };
  });

  app.post('/v1/safety/reports', async (request, reply) => {
    const requestId = createId();
    const principal = await dependencies.authorizer.authorize({
      requestId,
      remoteAddress: request.ip,
      action: 'submit_report',
    });
    if (principal?.userId === undefined) {
      return reply.code(403).send({
        error: { code: 'SAFETY_ACCESS_DENIED', message: 'Safety report access is not authorized.', request_id: requestId },
      });
    }

    const parsed = submitSafetyReportSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: { code: 'INVALID_SAFETY_REPORT', message: 'Safety report does not match the service contract.', request_id: requestId },
      });
    }
    if (!(await dependencies.store.isReady())) {
      return reply.code(503).send({
        error: { code: 'SAFETY_STORE_UNAVAILABLE', message: 'Safety report storage is unavailable.', request_id: requestId },
      });
    }

    const reportId = createId();
    const record = await dependencies.store.createReport({
      reportId,
      reporterUserId: principal.userId,
      targetType: parsed.data.target.type,
      targetId: parsed.data.target.id,
      category: parsed.data.category,
      ...(parsed.data.note === undefined ? {} : { note: parsed.data.note }),
      relatedEntityRefs: parsed.data.related_entity_refs,
      createdAt: now().toISOString(),
    });

    return reply.code(202).send({
      v: SAFETY_CONTRACT_VERSION,
      request_id: requestId,
      report_id: record.reportId,
      status: record.status,
      created_at: record.createdAt,
    });
  });

  return app;
}
