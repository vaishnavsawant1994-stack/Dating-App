import { describe, expect, it } from 'vitest';
import { loadMediaConfig } from '../src/config.js';
import { buildS3ClientConfig } from '../src/storage.js';

describe('Media configuration', () => {
  it('supports S3-compatible local endpoints without weakening default encryption', () => {
    const config = loadMediaConfig({
      APP_ENV: 'test',
      MEDIA_S3_ENDPOINT: 'http://127.0.0.1:9000',
      MEDIA_S3_FORCE_PATH_STYLE: 'true',
      MEDIA_S3_ACCESS_KEY_ID: 'test-access',
      MEDIA_S3_SECRET_ACCESS_KEY: 'test-secret',
    });
    expect(config.encryption).toBe('AES256');
    expect(buildS3ClientConfig(config)).toMatchObject({
      endpoint: 'http://127.0.0.1:9000',
      forcePathStyle: true,
      credentials: { accessKeyId: 'test-access', secretAccessKey: 'test-secret' },
    });
  });

  it('requires credential pairs and fails closed on unencrypted production storage', () => {
    expect(() => loadMediaConfig({ MEDIA_S3_ACCESS_KEY_ID: 'only-one' })).toThrow(/configured together/i);
    expect(() => loadMediaConfig({ APP_ENV: 'production', MEDIA_S3_SSE: 'none' })).toThrow(/cannot be disabled/i);
  });

  it('requires a KMS key when KMS encryption is selected', () => {
    expect(() => loadMediaConfig({ APP_ENV: 'test', MEDIA_S3_SSE: 'aws:kms' })).toThrow(/KMS_KEY_ID/i);
  });
});
