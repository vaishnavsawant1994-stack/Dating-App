export type SafetyEnvironment = 'local' | 'test' | 'sandbox' | 'preview' | 'staging' | 'production';

export interface SafetyConfig {
  readonly environment: SafetyEnvironment;
  readonly serviceName: string;
  readonly host: string;
  readonly port: number;
  readonly logging: boolean;
  readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  readonly bodyLimitBytes: number;
}

export interface SafetyPrincipal {
  readonly actorId: string;
  readonly actorType: 'user' | 'staff' | 'service';
  readonly userId?: string;
}

export interface SafetyAccessContext {
  readonly requestId: string;
  readonly remoteAddress: string;
  readonly action: 'submit_report';
}

export interface SafetyAccessAuthorizer {
  isReady(): boolean;
  authorize(context: SafetyAccessContext): Promise<SafetyPrincipal | null>;
}

export interface SafetyReportRecord {
  readonly reportId: string;
  readonly reporterUserId: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly category: string;
  readonly note?: string;
  readonly relatedEntityRefs: readonly Readonly<{ type: string; id: string }>[];
  readonly status: 'received';
  readonly createdAt: string;
}

export interface CreateSafetyReportInput extends Omit<SafetyReportRecord, 'status'> {}

export interface SafetyReportStore {
  readonly name: string;
  isReady(): Promise<boolean>;
  createReport(input: CreateSafetyReportInput): Promise<SafetyReportRecord>;
}
