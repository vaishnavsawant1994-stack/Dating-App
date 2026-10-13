import { type ApiErrorCode, type ApiErrorEnvelope } from '@together/contracts';
import { type FastifyError, type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';

function errorEnvelope(
  requestId: string,
  code: ApiErrorCode,
  message: string,
  retryable: boolean,
): ApiErrorEnvelope {
  return {
    error: {
      code,
      message,
      request_id: requestId,
      retryable,
    },
  };
}

function sendError(
  request: FastifyRequest,
  reply: FastifyReply,
  statusCode: number,
  code: ApiErrorCode,
  message: string,
  retryable: boolean,
): void {
  void reply.code(statusCode).send(errorEnvelope(request.id, code, message, retryable));
}

export function registerErrorHandling(app: FastifyInstance): void {
  app.setNotFoundHandler((request, reply) => {
    sendError(request, reply, 404, 'NOT_FOUND', 'The requested resource was not found.', false);
  });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation !== undefined || error.statusCode === 400 || error.statusCode === 413) {
      sendError(request, reply, 400, 'VALIDATION_FAILED', 'The request is invalid.', false);
      return;
    }

    request.log.error({ err: error, request_id: request.id }, 'Unhandled request error');
    sendError(request, reply, 500, 'INTERNAL_ERROR', 'An internal error occurred.', true);
  });
}
