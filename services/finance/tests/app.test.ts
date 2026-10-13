import { describe, expect, it } from 'vitest';
import { buildFinanceApp } from '../src/app.js';
import { InMemoryFinanceLedgerStore } from '../src/store.js';
import { type FinanceAccessAuthorizer, type FinanceConfig } from '../src/types.js';

const eventId = '018f0c18-7b9d-7a1c-8d23-9cfdb65b4a31';
const config: FinanceConfig = {
  environment: 'test', serviceName: 'finance', host: '127.0.0.1', port: 0,
  logging: false, logLevel: 'error', bodyLimitBytes: 65_536,
};
const allowService: FinanceAccessAuthorizer = {
  isReady: () => true,
  authorize: async () => ({ actorId: 'ledger-service', actorType: 'service' }),
};
const balancedPayload = {
  v: 1,
  book: 'coin',
  unit: 'COIN',
  economic_event_type: 'coin_purchase',
  economic_event_id: eventId,
  entries: [
    { account_id: 'coin:platform:cash', amount_minor: '-500' },
    { account_id: 'coin:user:liability', amount_minor: '500' },
  ],
} as const;

describe('Finance application', () => {
  it('separates liveness from authorization/store readiness', async () => {
    const app = await buildFinanceApp(config, {
      authorizer: { isReady: () => false, authorize: async () => null },
      store: new InMemoryFinanceLedgerStore(),
    });
    await app.ready();
    expect((await app.inject({ method: 'GET', url: '/health/live' })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/health/ready' })).statusCode).toBe(503);
    await app.close();
  });

  it('posts a balanced immutable ledger command and replays idempotently', async () => {
    let id = 0;
    const app = await buildFinanceApp(config, {
      authorizer: allowService,
      store: new InMemoryFinanceLedgerStore(),
      createId: () => `id-${String(++id).padStart(8, '0')}`,
      now: () => new Date('2026-10-14T00:00:00Z'),
    });
    await app.ready();
    const request = {
      method: 'POST' as const,
      url: '/v1/finance/ledger-transactions',
      headers: { 'idempotency-key': 'purchase_0001' },
      payload: balancedPayload,
    };
    const first = await app.inject(request);
    const second = await app.inject(request);
    expect(first.statusCode).toBe(201);
    expect(second.statusCode).toBe(201);
    expect(first.json()).toMatchObject({ v: 1, request_id: 'id-00000001', transaction_id: 'id-00000002', book: 'coin', unit: 'COIN', status: 'posted' });
    expect(second.json().transaction_id).toBe(first.json().transaction_id);
    await app.close();
  });

  it('rejects missing idempotency, unauthorized writes, and ledger invariant violations', async () => {
    const store = new InMemoryFinanceLedgerStore();
    const allowed = await buildFinanceApp(config, { authorizer: allowService, store });
    await allowed.ready();
    expect((await allowed.inject({ method: 'POST', url: '/v1/finance/ledger-transactions', payload: balancedPayload })).statusCode).toBe(400);
    const unbalanced = { ...balancedPayload, entries: [
      { account_id: 'coin:platform:cash', amount_minor: '-499' },
      { account_id: 'coin:user:liability', amount_minor: '500' },
    ] };
    expect((await allowed.inject({
      method: 'POST', url: '/v1/finance/ledger-transactions', headers: { 'idempotency-key': 'purchase_0002' }, payload: unbalanced,
    })).statusCode).toBe(400);
    await allowed.close();

    const denied = await buildFinanceApp(config, {
      authorizer: { isReady: () => true, authorize: async () => null }, store,
    });
    await denied.ready();
    expect((await denied.inject({
      method: 'POST', url: '/v1/finance/ledger-transactions', headers: { 'idempotency-key': 'purchase_0003' }, payload: balancedPayload,
    })).statusCode).toBe(403);
    await denied.close();
  });
});
