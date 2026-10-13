import { z } from 'zod';
import { type FinanceConfig } from './types.js';

const envSchema = z.object({
  APP_ENV: z.enum(['local', 'test', 'sandbox', 'preview', 'staging', 'production']).default('local'),
  SERVICE_NAME: z.string().min(1).max(64).default('finance'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  FINANCE_HOST: z.string().min(1).default('127.0.0.1'),
  FINANCE_PORT: z.coerce.number().int().min(0).max(65_535).default(3006),
  FINANCE_BODY_LIMIT_BYTES: z.coerce.number().int().min(1_024).max(262_144).default(65_536),
});

export function loadFinanceConfig(env: NodeJS.ProcessEnv): FinanceConfig {
  const parsed = envSchema.parse(env);
  return {
    environment: parsed.APP_ENV,
    serviceName: parsed.SERVICE_NAME,
    host: parsed.FINANCE_HOST,
    port: parsed.FINANCE_PORT,
    logging: parsed.APP_ENV !== 'test',
    logLevel: parsed.LOG_LEVEL,
    bodyLimitBytes: parsed.FINANCE_BODY_LIMIT_BYTES,
  };
}
