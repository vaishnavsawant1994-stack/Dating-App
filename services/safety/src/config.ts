import { z } from 'zod';
import { type SafetyConfig } from './types.js';

const envSchema = z.object({
  APP_ENV: z.enum(['local', 'test', 'sandbox', 'preview', 'staging', 'production']).default('local'),
  SERVICE_NAME: z.string().min(1).max(64).default('safety'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  SAFETY_HOST: z.string().min(1).default('127.0.0.1'),
  SAFETY_PORT: z.coerce.number().int().min(0).max(65_535).default(3005),
  SAFETY_BODY_LIMIT_BYTES: z.coerce.number().int().min(1_024).max(262_144).default(65_536),
});

export function loadSafetyConfig(env: NodeJS.ProcessEnv): SafetyConfig {
  const parsed = envSchema.parse(env);
  return {
    environment: parsed.APP_ENV,
    serviceName: parsed.SERVICE_NAME,
    host: parsed.SAFETY_HOST,
    port: parsed.SAFETY_PORT,
    logging: parsed.APP_ENV !== 'test',
    logLevel: parsed.LOG_LEVEL,
    bodyLimitBytes: parsed.SAFETY_BODY_LIMIT_BYTES,
  };
}
