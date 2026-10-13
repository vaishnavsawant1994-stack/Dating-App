import { z } from 'zod';
import { type MediaConfig } from './types.js';

const environmentSchema = z.enum(['local', 'test', 'sandbox', 'preview', 'staging', 'production']);
const logLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);
const encryptionSchema = z.enum(['AES256', 'aws:kms', 'none']);

const envSchema = z.object({
  APP_ENV: environmentSchema.default('local'),
  SERVICE_NAME: z.string().min(1).max(64).default('media'),
  LOG_LEVEL: logLevelSchema.default('info'),
  MEDIA_HOST: z.string().min(1).default('127.0.0.1'),
  MEDIA_PORT: z.coerce.number().int().min(0).max(65_535).default(3004),
  MEDIA_BODY_LIMIT_BYTES: z.coerce.number().int().min(1_024).max(1_048_576).default(65_536),
  MEDIA_S3_PUBLIC_BUCKET: z.string().min(3).max(63).default('together-public-media'),
  MEDIA_S3_PRIVATE_BUCKET: z.string().min(3).max(63).default('together-private-media'),
  MEDIA_S3_ENDPOINT: z.string().url().optional(),
  MEDIA_S3_REGION: z.string().min(2).max(64).default('us-east-1'),
  MEDIA_S3_FORCE_PATH_STYLE: z.enum(['true', 'false']).default('false'),
  MEDIA_S3_ACCESS_KEY_ID: z.string().min(1).optional(),
  MEDIA_S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  MEDIA_S3_SSE: encryptionSchema.default('AES256'),
  MEDIA_S3_KMS_KEY_ID: z.string().min(1).optional(),
  MEDIA_UPLOAD_TTL_SECONDS: z.coerce.number().int().min(60).max(900).default(300),
  MEDIA_DOWNLOAD_TTL_SECONDS: z.coerce.number().int().min(60).max(3600).default(600),
});

export function loadMediaConfig(env: NodeJS.ProcessEnv): MediaConfig {
  const parsed = envSchema.parse(env);
  const hasAccess = parsed.MEDIA_S3_ACCESS_KEY_ID !== undefined;
  const hasSecret = parsed.MEDIA_S3_SECRET_ACCESS_KEY !== undefined;
  if (hasAccess !== hasSecret) {
    throw new Error('MEDIA_S3_ACCESS_KEY_ID and MEDIA_S3_SECRET_ACCESS_KEY must be configured together.');
  }
  if (parsed.MEDIA_S3_SSE === 'aws:kms' && parsed.MEDIA_S3_KMS_KEY_ID === undefined) {
    throw new Error('MEDIA_S3_KMS_KEY_ID is required when MEDIA_S3_SSE=aws:kms.');
  }
  if (['preview', 'staging', 'production'].includes(parsed.APP_ENV) && parsed.MEDIA_S3_SSE === 'none') {
    throw new Error('Media encryption cannot be disabled outside local, test, and sandbox environments.');
  }

  return {
    environment: parsed.APP_ENV,
    serviceName: parsed.SERVICE_NAME,
    host: parsed.MEDIA_HOST,
    port: parsed.MEDIA_PORT,
    logging: parsed.APP_ENV !== 'test',
    logLevel: parsed.LOG_LEVEL,
    bodyLimitBytes: parsed.MEDIA_BODY_LIMIT_BYTES,
    publicBucket: parsed.MEDIA_S3_PUBLIC_BUCKET,
    privateBucket: parsed.MEDIA_S3_PRIVATE_BUCKET,
    ...(parsed.MEDIA_S3_ENDPOINT === undefined ? {} : { endpoint: parsed.MEDIA_S3_ENDPOINT }),
    region: parsed.MEDIA_S3_REGION,
    forcePathStyle: parsed.MEDIA_S3_FORCE_PATH_STYLE === 'true',
    ...(parsed.MEDIA_S3_ACCESS_KEY_ID === undefined ? {} : { accessKeyId: parsed.MEDIA_S3_ACCESS_KEY_ID }),
    ...(parsed.MEDIA_S3_SECRET_ACCESS_KEY === undefined ? {} : { secretAccessKey: parsed.MEDIA_S3_SECRET_ACCESS_KEY }),
    encryption: parsed.MEDIA_S3_SSE,
    ...(parsed.MEDIA_S3_KMS_KEY_ID === undefined ? {} : { kmsKeyId: parsed.MEDIA_S3_KMS_KEY_ID }),
    uploadTtlSeconds: parsed.MEDIA_UPLOAD_TTL_SECONDS,
    downloadTtlSeconds: parsed.MEDIA_DOWNLOAD_TTL_SECONDS,
  };
}
