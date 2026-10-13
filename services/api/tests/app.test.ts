import { describe, expect, it } from 'vitest';
import { buildApiApp } from '../src/app.js';

const config = {
  serviceName: 'api',
  environment: 'test' as const,
  buildId: 'test-build',
  logLevel: 'silent',
  bodyLimitBytes: 1024,
  logging: false,
};

describe('@together/api', () => {
  it('serves liveness, readiness, and minimal system information', async () => {
    const app = await buildApiApp(config, {
      checkDatabaseHealth: async () => ({ ok: true, durationMs: 1 }),
    });

    try {
      const live = await app.inject({ method: 'GET', url: '/health/live' });
      const ready = await app.inject({ method: 'GET', url: '/health/ready' });
      const system = await app.inject({ method: 'GET', url: '/v1/system/info' });

      expect(live.statusCode).toBe(200);
      expect(live.json()).toMatchObject({ status: 'ok', service: 'api', version: 'test-build' });
      expect(ready.statusCode).toBe(200);
      expect(system.json()).toEqual({ service: 'api', api_version: 'v1', environment: 'test' });
    } finally {
      await app.close();
    }
  });

  it('fails readiness safely when PostgreSQL is unavailable', async () => {
    const app = await buildApiApp(config, {
      checkDatabaseHealth: async () => ({ ok: false, durationMs: 2 }),
    });

    try {
      const response = await app.inject({ method: 'GET', url: '/health/ready' });
      expect(response.statusCode).toBe(503);
      expect(response.json()).toMatchObject({
        error: { code: 'TEMPORARILY_UNAVAILABLE', retryable: true },
      });
      expect(JSON.stringify(response.json())).not.toContain('DATABASE_URL');
    } finally {
      await app.close();
    }
  });

  it('preserves valid request IDs and generates safe IDs for invalid values', async () => {
    const app = await buildApiApp(config, {
      checkDatabaseHealth: async () => ({ ok: true, durationMs: 1 }),
    });

    try {
      const requestId = '123e4567-e89b-42d3-a456-426614174000';
      const preserved = await app.inject({
        method: 'GET',
        url: '/health/live',
        headers: { 'x-request-id': requestId },
      });
      const generated = await app.inject({
        method: 'GET',
        url: '/health/live',
        headers: { 'x-request-id': 'not-a-valid-id' },
      });

      expect(preserved.headers['x-request-id']).toBe(requestId);
      expect(generated.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(generated.headers['x-trace-id']).toMatch(/^[0-9a-f]{32}$/);
    } finally {
      await app.close();
    }
  });

  it('uses the canonical safe not-found envelope and security headers', async () => {
    const app = await buildApiApp(config, {
      checkDatabaseHealth: async () => ({ ok: true, durationMs: 1 }),
    });

    try {
      const response = await app.inject({ method: 'GET', url: '/does-not-exist' });
      expect(response.statusCode).toBe(404);
      expect(response.json()).toMatchObject({ error: { code: 'NOT_FOUND', retryable: false } });
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(JSON.stringify(response.json())).not.toMatch(/stack|sql|postgres/i);
    } finally {
      await app.close();
    }
  });
});
