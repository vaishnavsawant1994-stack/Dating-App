import { createHash } from 'node:crypto';
import { type PostLedgerTransaction } from './contracts.js';

const coinEvents = new Set(['coin_purchase', 'gift_spend', 'coin_refund', 'coin_adjustment']);
const earningEvents = new Set(['creator_earning', 'earning_reversal', 'payout', 'payout_reversal', 'earning_adjustment']);

export class LedgerValidationError extends Error {}

export function validateLedgerTransaction(input: PostLedgerTransaction): void {
  if (input.book === 'coin') {
    if (input.unit !== 'COIN') {
      throw new LedgerValidationError('Coin ledger unit must be COIN.');
    }
    if (!coinEvents.has(input.economic_event_type)) {
      throw new LedgerValidationError('Economic event is not valid for the coin ledger.');
    }
  } else {
    if (!/^[A-Z]{3}$/.test(input.unit)) {
      throw new LedgerValidationError('Earnings ledger unit must be an ISO-style three-letter currency code.');
    }
    if (!earningEvents.has(input.economic_event_type)) {
      throw new LedgerValidationError('Economic event is not valid for the earnings ledger.');
    }
  }

  const accounts = new Set<string>();
  let sum = 0n;
  for (const entry of input.entries) {
    if (accounts.has(entry.account_id)) {
      throw new LedgerValidationError('Ledger account IDs must be unique within a transaction.');
    }
    accounts.add(entry.account_id);
    sum += BigInt(entry.amount_minor);
  }
  if (sum !== 0n) {
    throw new LedgerValidationError('Ledger entries must sum to zero.');
  }
}

export function ledgerCommandFingerprint(input: Omit<PostLedgerTransaction, 'v'>): string {
  return createHash('sha256').update(JSON.stringify(input), 'utf8').digest('hex');
}
