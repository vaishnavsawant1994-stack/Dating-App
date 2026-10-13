import {
  createTraceId,
  runWithRequestContext,
  traceIdFromTraceParent,
} from '@together/observability';
import { UuidSchema } from '@together/validation';
import { type FastifyInstance } from 'fastify';

function singleHeader(value: string | string[] | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function validOrGeneratedRequestId(value: string | undefined, generate: () => string): string {
  return UuidSchema.safeParse(value).success ? (value as string) : generate();
}

export function registerRequestContext(app: FastifyInstance): void {
  app.addHook('onRequest', (request, reply, done) => {
    const traceId = traceIdFromTraceParent(singleHeader(request.headers.traceparent)) ?? createTraceId();
    const context = {
      requestId: request.id,
      traceId,
      ...(singleHeader(request.headers['x-client-version']) === undefined
        ? {}
        : { clientVersion: singleHeader(request.headers['x-client-version']) }),
      ...(singleHeader(request.headers['x-platform']) === undefined
        ? {}
        : { client: singleHeader(request.headers['x-platform']) }),
      ...(singleHeader(request.headers['x-identity-id']) === undefined
        ? {}
        : { identityId: singleHeader(request.headers['x-identity-id']) }),
    };

    reply.header('x-request-id', request.id);
    reply.header('x-trace-id', traceId);
    runWithRequestContext(context, done);
  });
}
