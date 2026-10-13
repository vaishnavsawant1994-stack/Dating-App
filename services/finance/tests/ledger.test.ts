import { describe, expect, it } from 'vitest';
import { postLedgerTransactionSchema } from '../src/contracts.js';
import { validateLedgerTransaction } from '../src/ledger.js';

const eventId = '018f0c18-7b9d-7a1c-8d23-9cfdb65b4a21';

function parse(input: unknown) {
  return postLedgerTransactionSchema.parse(input);
}

describe('finance ledger invariants', () => {
  it('accepts exact balanced integer coin entries', () => {
    const transaction = parse({
      v: 1, book: 'coin', unit: 'COIN', economic_event_type: 'gift_spend', economic_event_id: eventId,
      entries: [
        { account_id: 'coin:user:sender', amount_minor: '-100' },
        { account_id: 'coin:platform:liability', amount_minor: '100' },
      ],
    });
    expect(() => validateLedgerTransaction(transaction)).not.toThrow();
  });

  it('rejects unbalanced entries, duplicate accounts, zero/decimal values', () => {
    const unbalanced = parse({
      v: 1, book: 'earnings', unit: 'INR', economic_event_type: 'creator_earning', economic_event_id: eventId,
      entries: [
        { account_id: 'earnings:platform', amount_minor: '-101' },
        { account_id: 'earnings:creator', amount_minor: '100' },
      ],
    });
    expect(() => validateLedgerTransaction(unbalanced)).toThrow(/sum to zero/i);
    expect(postLedgerTransactionSchema.safeParse({
      v: 1, book: 'coin', unit: 'COIN', economic_event_type: 'coin_purchase', economic_event_id: eventId,
      entries: [{ account_id: 'coin:a', amount_minor: '0' }, { account_id: 'coin:b', amount_minor: '0.0' }],
    }).success).toBe(false);

    const duplicate = parse({
      v: 1, book: 'coin', unit: 'COIN', economic_event_type: 'coin_purchase', economic_event_id: eventId,
      entries: [{ account_id: 'coin:same', amount_minor: '-1' }, { account_id: 'coin:same', amount_minor: '1' }],
    });
    expect(() => validateLedgerTransaction(duplicate)).toThrow(/unique/i);
  });

  it('prevents coin-to-cashout semantics by separating book event types', () => {
    const coinPayout = parse({
      v: 1, book: 'coin', unit: 'COIN', economic_event_type: 'payout', economic_event_id: eventId,
      entries: [{ account_id: 'coin:user', amount_minor: '-100' }, { account_id: 'coin:cashout', amount_minor: '100' }],
    });
    expect(() => validateLedgerTransaction(coinPayout)).toThrow(/coin ledger/i);

    const earningsCoinUnit = parse({
      v: 1, book: 'earnings', unit: 'COIN', economic_event_type: 'payout', economic_event_id: eventId,
      entries: [{ account_id: 'earnings:creator', amount_minor: '-100' }, { account_id: 'earnings:payout', amount_minor: '100' }],
    });
    expect(() => validateLedgerTransaction(earningsCoinUnit)).toThrow(/currency/i);
  });
});
