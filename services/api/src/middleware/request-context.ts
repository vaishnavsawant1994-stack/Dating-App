import {
  createTraceId,
  runWithRequestContext,
  traceIdFromTraceParent,
  type RequestContext,
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
    const clientVersion = singleHeader(request.headers['x-client-version']);
    const client = singleHeader(request.headers['x-platform']);
    const identityId = singleHeader(request.headers['x-identity-id']);
    const context: RequestContext = {
      requestId: request.id,
      traceId,
      ...(clientVersion === undefined ? {} : { clientVersion }),
      ...(client === undefined ? {} : { client }),
      ...(identityId === undefined ? {} : { identityId }),
    };

    reply.header('x-request-id', request.id);
    reply.header('x-trace-id', traceId);
    runWithRequestContext(context, done);
  });
}
