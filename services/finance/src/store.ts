import { createHash } from 'node:crypto';
import { type FinanceLedgerStore, type LedgerTransactionCommand, type PostedLedgerTransaction } from './types.js';

export class FinanceIdempotencyConflictError extends Error {}

export class DisabledFinanceLedgerStore implements FinanceLedgerStore {
  readonly name = 'disabled';

  async isReady(): Promise<boolean> {
    return false;
  }

  async post(): Promise<PostedLedgerTransaction> {
    throw new Error('Finance ledger persistence is not configured.');
  }
}

function businessCommandFingerprint(command: LedgerTransactionCommand): string {
  const stable = {
    book: command.book,
    unit: command.unit,
    economicEventType: command.economicEventType,
    economicEventId: command.economicEventId,
    entries: command.entries,
    actorId: command.actorId,
    actorType: command.actorType,
  };
  return createHash('sha256').update(JSON.stringify(stable), 'utf8').digest('hex');
}

export class InMemoryFinanceLedgerStore implements FinanceLedgerStore {
  readonly name = 'memory-test-only';
  private readonly byIdempotency = new Map<string, Readonly<{ fingerprint: string; transaction: PostedLedgerTransaction }>>();

  async isReady(): Promise<boolean> {
    return true;
  }

  async post(command: LedgerTransactionCommand): Promise<PostedLedgerTransaction> {
    const key = `${command.book}:${command.idempotencyKey}`;
    const fingerprint = businessCommandFingerprint(command);
    const existing = this.byIdempotency.get(key);
    if (existing !== undefined) {
      if (existing.fingerprint !== fingerprint) {
        throw new FinanceIdempotencyConflictError('Idempotency key was already used for a different transaction.');
      }
      return existing.transaction;
    }
    const transaction: PostedLedgerTransaction = { ...command, status: 'posted' };
    this.byIdempotency.set(key, { fingerprint, transaction });
    return transaction;
  }
}
