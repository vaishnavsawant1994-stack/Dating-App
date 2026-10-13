import { z } from 'zod';
import { RuntimeEnvironmentSchema } from './environment.js';

export const BaseServerEnvironmentSchema = z
  .object({
    APP_ENV: RuntimeEnvironmentSchema.default('local'),
    SERVICE_NAME: z.string().trim().min(1),
    LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  })
  .passthrough();

export type BaseServerEnvironment = z.infer<typeof BaseServerEnvironmentSchema>;
