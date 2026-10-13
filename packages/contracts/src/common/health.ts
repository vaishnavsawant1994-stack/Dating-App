import { z } from 'zod';

export const HealthStatusSchema = z.enum(['ok', 'degraded']);

export const HealthResponseSchema = z.object({
  status: HealthStatusSchema,
  service: z.string().min(1),
  version: z.string().min(1),
  environment: z.enum(['local', 'test', 'preview', 'staging', 'sandbox', 'production']),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const SystemInfoSchema = z.object({
  service: z.string().min(1),
  api_version: z.literal('v1'),
  environment: z.enum(['local', 'test', 'preview', 'staging', 'sandbox', 'production']),
});

export type SystemInfo = z.infer<typeof SystemInfoSchema>;
