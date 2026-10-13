import { describe, expect, it } from 'vitest';
import { buildSafetyApp } from '../src/app.js';
import { InMemorySafetyReportStore } from '../src/store.js';
import { type SafetyAccessAuthorizer, type SafetyConfig } from '../src/types.js';

const targetId = '018f0c18-7b9d-7a1c-8d23-9cfdb65b4a11';
const reporterId = '018f0c18-7b9d-7a1c-8d23-9cfdb65b4a12';
const config: SafetyConfig = {
  environment: 'test', serviceName: 'safety', host: '127.0.0.1', port: 0,
  logging: false, logLevel: 'error', bodyLimitBytes: 65_536,
};
const allowUser: SafetyAccessAuthorizer = {
  isReady: () => true,
  authorize: async () => ({ actorId: reporterId, actorType: 'user', userId: reporterId }),
};

describe('Safety application', () => {
  it('separates liveness from authorization/store readiness', async () => {
    const app = await buildSafetyApp(config, {
      authorizer: { isReady: () => false, authorize: async () => null },
      store: new InMemorySafetyReportStore(),
    });
    await app.ready();
    expect((await app.inject({ method: 'GET', url: '/health/live' })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/health/ready' })).statusCode).toBe(503);
    await app.close();
  });

  it('derives reporter identity from authorization rather than request body', async () => {
    let id = 0;
    const store = new InMemorySafetyReportStore();
    const app = await buildSafetyApp(config, {
      authorizer: allowUser,
      store,
      createId: () => `id-${String(++id).padStart(8, '0')}`,
      now: () => new Date('2026-10-14T00:00:00Z'),
    });
    await app.ready();
    const response = await app.inject({
      method: 'POST', url: '/v1/safety/reports',
      payload: { v: 1, target: { type: 'identity', id: targetId }, category: 'impersonation' },
    });
    expect(response.statusCode).toBe(202);
    expect(response.json()).toMatchObject({ v: 1, request_id: 'id-00000001', report_id: 'id-00000002', status: 'received' });
    expect(store.get('id-00000002')?.reporterUserId).toBe(reporterId);
    await app.close();
  });

  it('denies unauthenticated callers before accepting report data', async () => {
    const app = await buildSafetyApp(config, {
      authorizer: { isReady: () => true, authorize: async () => null },
      store: new InMemorySafetyReportStore(),
    });
    await app.ready();
    const response = await app.inject({
      method: 'POST', url: '/v1/safety/reports',
      payload: { v: 1, target: { type: 'user', id: targetId }, category: 'spam' },
    });
    expect(response.statusCode).toBe(403);
    await app.close();
  });
});
