import Fastify, { type FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';
import { bucketClassForIntent, createObjectKey, mediaSizeAllowed, uploadIntentSchema } from './policy.js';
import { type MediaAccessAuthorizer, type MediaConfig, type MediaStorageAdapter } from './types.js';

interface MediaAppDependencies {
  readonly storage: MediaStorageAdapter;
  readonly authorizer: MediaAccessAuthorizer;
  readonly createId?: () => string;
  readonly now?: () => Date;
}

export async function buildMediaApp(config: MediaConfig, dependencies: MediaAppDependencies): Promise<FastifyInstance> {
  const createId = dependencies.createId ?? randomUUID;
  const now = dependencies.now ?? (() => new Date());
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
    if (!(await dependencies.storage.isReady())) {
      return reply.code(503).send({ status: 'not_ready', dependency: 'storage' });
    }
    return { status: 'ready', service: config.serviceName, storage: dependencies.storage.name };
  });

  app.post('/v1/media/upload-intents', async (request, reply) => {
    const requestId = createId();
    const parsed = uploadIntentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: { code: 'INVALID_MEDIA_INTENT', message: 'Media upload intent does not match the service contract.', request_id: requestId },
      });
    }
    if (!mediaSizeAllowed(parsed.data)) {
      return reply.code(413).send({
        error: { code: 'MEDIA_TOO_LARGE', message: 'Media exceeds the limit for its content type.', request_id: requestId },
      });
    }

    const bucketClass = bucketClassForIntent(parsed.data);
    const allowed = await dependencies.authorizer.authorize({
      requestId,
      remoteAddress: request.ip,
      action: 'create_upload',
      bucketClass,
    });
    if (!allowed) {
      return reply.code(403).send({
        error: { code: 'MEDIA_ACCESS_DENIED', message: 'Media service access is not authorized.', request_id: requestId },
      });
    }
    if (!(await dependencies.storage.isReady())) {
      return reply.code(503).send({
        error: { code: 'MEDIA_STORAGE_UNAVAILABLE', message: 'Media storage is unavailable.', request_id: requestId },
      });
    }

    const mediaId = createId();
    const objectKey = createObjectKey(parsed.data, mediaId, now());
    const upload = await dependencies.storage.createUploadUrl({
      bucketClass,
      objectKey,
      contentType: parsed.data.content_type,
      sizeBytes: parsed.data.size_bytes,
      ...(parsed.data.checksum_sha256 === undefined ? {} : { checksumSha256: parsed.data.checksum_sha256 }),
    });

    return reply.code(201).send({
      request_id: requestId,
      media_id: mediaId,
      bucket_class: bucketClass,
      object_key: objectKey,
      processing_state: 'pending_upload',
      upload: {
        method: 'PUT',
        url: upload.url,
        headers: upload.headers,
        expires_at: upload.expiresAt,
      },
    });
  });

  return app;
}
