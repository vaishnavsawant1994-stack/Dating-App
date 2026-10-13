import { z } from 'zod';

export const UuidSchema = z.string().uuid();
export const RequestIdSchema = UuidSchema;
export const TraceIdSchema = z.string().regex(/^[a-f0-9]{16,32}$/i, 'Invalid trace identifier');
export const IdempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(200)
  .regex(/^[A-Za-z0-9._:-]+$/, 'Invalid idempotency key');

export type Uuid = z.infer<typeof UuidSchema>;
