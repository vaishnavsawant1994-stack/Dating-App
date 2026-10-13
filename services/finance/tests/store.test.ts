import { describe, expect, it } from 'vitest';
import { FinanceIdempotencyConflictError, InMemoryFinanceLedgerStore } from '../src/store.js';

function command(amount = '100') {
  return {
    transactionId: 'transaction-1',
    idempotencyKey: 'idem-key-1',
    book: 'coin',
    unit: 'COIN',
    economicEventType: 'coin_purchase',
    economicEventId: 'event-1',
    entries: [
      { accountId: 'coin:platform:cash', amountMinor: `-${amount}` },
      { accountId: 'coin:user:liability', amountMinor: amount },
    ],
    createdAt: '2026-10-14T00:00:00.000Z',
    actorId: 'service-1',
    actorType: 'service',
  } as const;
}

describe('InMemoryFinanceLedgerStore', () => {
  it('returns the same posted transaction for an exact idempotent replay', async () => {
    const store = new InMemoryFinanceLedgerStore();
    const first = await store.post(command());
    const second = await store.post(command());
    expect(second).toEqual(first);
  });

  it('rejects idempotency-key reuse with different transaction data', async () => {
    const store = new InMemoryFinanceLedgerStore();
    await store.post(command());
    await expect(store.post(command('101'))).rejects.toBeInstanceOf(FinanceIdempotencyConflictError);
  });
});
