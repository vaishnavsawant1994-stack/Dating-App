import { describe, expect, it } from 'vitest';
import { buildMediaApp } from '../src/app.js';
import { type MediaAccessAuthorizer, type MediaConfig, type MediaStorageAdapter } from '../src/types.js';

const config: MediaConfig = {
  environment: 'test', serviceName: 'media', host: '127.0.0.1', port: 0, logging: false, logLevel: 'error',
  bodyLimitBytes: 65_536, publicBucket: 'public-bucket', privateBucket: 'private-bucket', region: 'us-east-1',
  forcePathStyle: true, encryption: 'AES256', uploadTtlSeconds: 300, downloadTtlSeconds: 600,
};

const allow: MediaAccessAuthorizer = { isReady: () => true, authorize: async () => true };

function fakeStorage(ready = true): MediaStorageAdapter {
  return {
    name: 'fake-storage',
    isReady: async () => ready,
    createUploadUrl: async (input) => ({
      url: `https://storage.test/${input.objectKey}`,
      expiresAt: '2026-10-14T00:05:00.000Z',
      headers: { 'content-type': input.contentType },
    }),
    createDownloadUrl: async (input) => ({
      url: `https://storage.test/${input.objectKey}`,
      expiresAt: '2026-10-14T00:10:00.000Z',
      headers: {},
    }),
  };
}

describe('Media application', () => {
  it('separates liveness from authorization/storage readiness', async () => {
    const app = await buildMediaApp(config, {
      storage: fakeStorage(),
      authorizer: { isReady: () => false, authorize: async () => false },
    });
    await app.ready();
    expect((await app.inject({ method: 'GET', url: '/health/live' })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/health/ready' })).statusCode).toBe(503);
    await app.close();
  });

  it('creates a signed upload intent with a service-owned opaque key', async () => {
    let id = 0;
    const app = await buildMediaApp(config, {
      storage: fakeStorage(), authorizer: allow,
      createId: () => `id-${String(++id).padStart(8, '0')}`,
      now: () => new Date('2026-10-14T00:00:00Z'),
    });
    await app.ready();
    const response = await app.inject({
      method: 'POST', url: '/v1/media/upload-intents',
      payload: { kind: 'profile_photo', visibility: 'private', content_type: 'image/jpeg', size_bytes: 1_024 },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      request_id: 'id-00000001', media_id: 'id-00000002', bucket_class: 'private',
      object_key: 'media/v1/private/2026/10/id-00000002.jpg', processing_state: 'pending_upload',
      upload: { method: 'PUT' },
    });
    await app.close();
  });

  it('denies access and rejects oversized media before signing', async () => {
    const denied = await buildMediaApp(config, {
      storage: fakeStorage(), authorizer: { isReady: () => true, authorize: async () => false },
    });
    await denied.ready();
    const denial = await denied.inject({
      method: 'POST', url: '/v1/media/upload-intents',
      payload: { kind: 'post_image', visibility: 'public', content_type: 'image/png', size_bytes: 100 },
    });
    expect(denial.statusCode).toBe(403);
    await denied.close();

    const bounded = await buildMediaApp(config, { storage: fakeStorage(), authorizer: allow });
    await bounded.ready();
    const tooLarge = await bounded.inject({
      method: 'POST', url: '/v1/media/upload-intents',
      payload: { kind: 'post_image', visibility: 'public', content_type: 'image/png', size_bytes: 25_000_001 },
    });
    expect(tooLarge.statusCode).toBe(413);
    await bounded.close();
  });
});
