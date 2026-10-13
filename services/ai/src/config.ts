import { z } from 'zod';
import { type AiConfig, type AiEnvironment, type AiProviderName } from './types.js';

const environmentSchema = z.enum(['local', 'test', 'sandbox', 'preview', 'staging', 'production']);
const logLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);
const providerSchema = z.enum(['fake', 'disabled']);

const envSchema = z.object({
  APP_ENV: environmentSchema.default('local'),
  SERVICE_NAME: z.string().min(1).max(64).default('ai'),
  LOG_LEVEL: logLevelSchema.default('info'),
  AI_HOST: z.string().min(1).default('127.0.0.1'),
  AI_PORT: z.coerce.number().int().min(0).max(65_535).default(3003),
  AI_PROVIDER: providerSchema.optional(),
  AI_MAX_INPUT_CHARS: z.coerce.number().int().min(100).max(1_000_000).default(100_000),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().min(1).max(32_768).default(4_096),
  AI_BODY_LIMIT_BYTES: z.coerce.number().int().min(1_024).max(2_097_152).default(262_144),
});

function defaultProvider(environment: AiEnvironment): AiProviderName {
  return environment === 'local' || environment === 'test' || environment === 'sandbox' ? 'fake' : 'disabled';
}

export function loadAiConfig(env: NodeJS.ProcessEnv): AiConfig {
  const parsed = envSchema.parse(env);
  const providerName = parsed.AI_PROVIDER ?? defaultProvider(parsed.APP_ENV);

  if (providerName === 'fake' && !['local', 'test', 'sandbox'].includes(parsed.APP_ENV)) {
    throw new Error('The fake AI provider is forbidden outside local, test, and sandbox environments.');
  }

  return {
    environment: parsed.APP_ENV,
    serviceName: parsed.SERVICE_NAME,
    host: parsed.AI_HOST,
    port: parsed.AI_PORT,
    logging: parsed.APP_ENV !== 'test',
    logLevel: parsed.LOG_LEVEL,
    providerName,
    maxInputChars: parsed.AI_MAX_INPUT_CHARS,
    maxOutputTokens: parsed.AI_MAX_OUTPUT_TOKENS,
    bodyLimitBytes: parsed.AI_BODY_LIMIT_BYTES,
  };
}
