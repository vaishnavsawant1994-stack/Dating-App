import { z } from 'zod';

export const ClientPlatformSchema = z.enum(['ios', 'android', 'web', 'admin', 'internal']);

export const RequestContextHeadersSchema = z.object({
  authorization: z.string().startsWith('Bearer ').optional(),
  'x-request-id': z.string().uuid().optional(),
  'x-client-version': z.string().min(1).max(100).optional(),
  'x-platform': ClientPlatformSchema.optional(),
  'x-device-id': z.string().uuid().optional(),
  'x-identity-id': z.string().uuid().optional(),
  'idempotency-key': z.string().min(8).max(200).optional(),
});

export type RequestContextHeaders = z.infer<typeof RequestContextHeadersSchema>;
