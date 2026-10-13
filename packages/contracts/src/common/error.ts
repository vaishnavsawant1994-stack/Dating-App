import { z } from 'zod';

export const stage0ErrorCodes = [
  'AUTH_REQUIRED',
  'AUTH_INVALID',
  'VALIDATION_FAILED',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'TEMPORARILY_UNAVAILABLE',
  'INTERNAL_ERROR',
] as const;

export const ApiErrorCodeSchema = z.enum(stage0ErrorCodes);
export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

export const ApiErrorSchema = z.object({
  code: ApiErrorCodeSchema,
  message: z.string().min(1),
  request_id: z.string().uuid(),
  retryable: z.boolean(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const ApiErrorEnvelopeSchema = z.object({
  error: ApiErrorSchema,
});

export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;
