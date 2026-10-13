import { type WebSocket } from 'ws';

export type RealtimeClientKind = 'web' | 'ios' | 'android' | 'test';

export interface RealtimePrincipal {
  readonly userId: string;
  readonly sessionId: string;
  readonly identityId?: string;
}

export interface RealtimeAuthContext {
  readonly requestId: string;
  readonly origin?: string;
  readonly remoteAddress: string;
}

export interface RealtimeTokenVerifier {
  isReady(): boolean;
  verify(token: string, context: RealtimeAuthContext): Promise<RealtimePrincipal | null>;
}

export interface RealtimeConfig {
  readonly environment: 'local' | 'test' | 'preview' | 'staging' | 'production';
  readonly serviceName: string;
  readonly host: string;
  readonly port: number;
  readonly logging: boolean;
  readonly logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  readonly allowedOrigins: ReadonlySet<string>;
  readonly maxPayloadBytes: number;
  readonly maxBufferedBytes: number;
  readonly heartbeatMs: number;
  readonly helloTimeoutMs: number;
  readonly rateWindowMs: number;
  readonly maxMessagesPerWindow: number;
}

export interface RealtimeDependencies {
  readonly tokenVerifier: RealtimeTokenVerifier;
  readonly createConnectionId?: () => string;
  readonly now?: () => Date;
}

export interface ConnectionRecord {
  readonly connectionId: string;
  readonly principal: RealtimePrincipal;
  readonly socket: WebSocket;
  initialized: boolean;
  alive: boolean;
  helloTimer?: NodeJS.Timeout;
}
