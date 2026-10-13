export type FinanceEnvironment = 'local' | 'test' | 'sandbox' | 'preview' | 'staging' | 'production';
export type LedgerBook = 'coin' | 'earnings';

export interface FinanceConfig {
  readonly environment: FinanceEnvironment;
  readonly serviceName: string;
  readonly host: string;
  readonly port: number;
  readonly logging: boolean;
  readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  readonly bodyLimitBytes: number;
}

export interface FinancePrincipal {
  readonly actorId: string;
  readonly actorType: 'staff' | 'service';
}

export interface FinanceAccessContext {
  readonly requestId: string;
  readonly remoteAddress: string;
  readonly action: 'post_ledger_transaction';
  readonly book: LedgerBook;
}

export interface FinanceAccessAuthorizer {
  isReady(): boolean;
  authorize(context: FinanceAccessContext): Promise<FinancePrincipal | null>;
}

export interface LedgerEntry {
  readonly accountId: string;
  readonly amountMinor: string;
}

export interface LedgerTransactionCommand {
  readonly transactionId: string;
  readonly idempotencyKey: string;
  readonly book: LedgerBook;
  readonly unit: string;
  readonly economicEventType: string;
  readonly economicEventId: string;
  readonly entries: readonly LedgerEntry[];
  readonly createdAt: string;
  readonly actorId: string;
  readonly actorType: 'staff' | 'service';
}

export interface PostedLedgerTransaction extends LedgerTransactionCommand {
  readonly status: 'posted';
}

export interface FinanceLedgerStore {
  readonly name: string;
  isReady(): Promise<boolean>;
  post(command: LedgerTransactionCommand): Promise<PostedLedgerTransaction>;
}
