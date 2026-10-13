export type AiEnvironment = 'local' | 'test' | 'sandbox' | 'preview' | 'staging' | 'production';
export type AiProviderName = 'fake' | 'disabled';

export interface AiConfig {
  readonly environment: AiEnvironment;
  readonly serviceName: string;
  readonly host: string;
  readonly port: number;
  readonly logging: boolean;
  readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  readonly providerName: AiProviderName;
  readonly maxInputChars: number;
  readonly maxOutputTokens: number;
  readonly bodyLimitBytes: number;
}

export interface AiAccessContext {
  readonly requestId: string;
  readonly remoteAddress: string;
  readonly purpose: string;
}

export interface AiAccessAuthorizer {
  isReady(): boolean;
  authorize(context: AiAccessContext): Promise<boolean>;
}

export interface AiProviderResult {
  readonly result: Readonly<Record<string, unknown>>;
}
