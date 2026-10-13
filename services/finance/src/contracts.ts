import { z } from 'zod';

export const FINANCE_CONTRACT_VERSION = 1 as const;

const entrySchema = z.object({
  account_id: z.string().regex(/^[a-z0-9][a-z0-9:_-]{2,127}$/),
  amount_minor: z.string().regex(/^-?[1-9][0-9]*$/),
}).strict();

export const postLedgerTransactionSchema = z.object({
  v: z.literal(FINANCE_CONTRACT_VERSION),
  book: z.enum(['coin', 'earnings']),
  unit: z.string().min(3).max(8),
  economic_event_type: z.enum([
    'coin_purchase',
    'gift_spend',
    'coin_refund',
    'coin_adjustment',
    'creator_earning',
    'earning_reversal',
    'payout',
    'payout_reversal',
    'earning_adjustment',
  ]),
  economic_event_id: z.string().uuid(),
  entries: z.array(entrySchema).min(2).max(16),
}).strict();

export type PostLedgerTransaction = z.infer<typeof postLedgerTransactionSchema>;
