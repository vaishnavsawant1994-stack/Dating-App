import { z } from 'zod';
import { type RealtimeConfig } from './types.js';

const environmentSchema = z.enum(['local', 'test', 'preview', 'staging', 'production']);
const logLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);

const envSchema = z.object({
  APP_ENV: environmentSchema.default('local'),
  SERVICE_NAME: z.string().min(1).max(64).default('realtime'),
  LOG_LEVEL: logLevelSchema.default('info'),
  REALTIME_HOST: z.string().min(1).default('127.0.0.1'),
  REALTIME_PORT: z.coerce.number().int().min(0).max(65_535).default(3002),
  REALTIME_ALLOWED_ORIGINS: z.string().default('http://127.0.0.1:3000,http://localhost:3000'),
  REALTIME_MAX_PAYLOAD_BYTES: z.coerce.number().int().min(1_024).max(262_144).default(32_768),
  REALTIME_MAX_BUFFERED_BYTES: z.coerce.number().int().min(16_384).max(4_194_304).default(524_288),
  REALTIME_HEARTBEAT_MS: z.coerce.number().int().min(5_000).max(120_000).default(30_000),
  REALTIME_HELLO_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(30_000).default(5_000),
  REALTIME_RATE_WINDOW_MS: z.coerce.number().int().min(1_000).max(60_000).default(10_000),
  REALTIME_MAX_MESSAGES_PER_WINDOW: z.coerce.number().int().min(1).max(500).default(100),
});

function parseOrigins(value: string): ReadonlySet<string> {
  const origins = value
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)
    .map((origin) => new URL(origin).origin);

  return new Set(origins);
}

export function loadRealtimeConfig(env: NodeJS.ProcessEnv): RealtimeConfig {
  const parsed = envSchema.parse(env);

  return {
    environment: parsed.APP_ENV,
    serviceName: parsed.SERVICE_NAME,
    host: parsed.REALTIME_HOST,
    port: parsed.REALTIME_PORT,
    logging: parsed.APP_ENV !== 'test',
    logLevel: parsed.LOG_LEVEL,
    allowedOrigins: parseOrigins(parsed.REALTIME_ALLOWED_ORIGINS),
    maxPayloadBytes: parsed.REALTIME_MAX_PAYLOAD_BYTES,
    maxBufferedBytes: parsed.REALTIME_MAX_BUFFERED_BYTES,
    heartbeatMs: parsed.REALTIME_HEARTBEAT_MS,
    helloTimeoutMs: parsed.REALTIME_HELLO_TIMEOUT_MS,
    rateWindowMs: parsed.REALTIME_RATE_WINDOW_MS,
    maxMessagesPerWindow: parsed.REALTIME_MAX_MESSAGES_PER_WINDOW,
  };
}
