import { z } from 'zod';
import { type RealtimeClientKind } from './types.js';

export const PROTOCOL_VERSION = 1 as const;

const envelopeBase = z.object({
  v: z.literal(PROTOCOL_VERSION),
  id: z.string().min(8).max(128),
});

export const clientHelloSchema = envelopeBase.extend({
  type: z.literal('client.hello'),
  payload: z.object({
    client: z.enum(['web', 'ios', 'android', 'test']),
    client_version: z.string().min(1).max(64),
  }).strict(),
}).strict();

export const clientPingSchema = envelopeBase.extend({
  type: z.literal('client.ping'),
  payload: z.object({
    nonce: z.string().min(1).max(128).optional(),
  }).strict().default({}),
}).strict();

export const clientEnvelopeSchema = z.discriminatedUnion('type', [clientHelloSchema, clientPingSchema]);
export type ClientEnvelope = z.infer<typeof clientEnvelopeSchema>;

export interface ConnectionReadyEnvelope {
  readonly v: typeof PROTOCOL_VERSION;
  readonly id: string;
  readonly type: 'connection.ready';
  readonly payload: {
    readonly connection_id: string;
    readonly heartbeat_ms: number;
    readonly max_payload_bytes: number;
    readonly server_time: string;
  };
}

export interface PongEnvelope {
  readonly v: typeof PROTOCOL_VERSION;
  readonly id: string;
  readonly type: 'server.pong';
  readonly payload: {
    readonly reply_to: string;
    readonly nonce?: string;
    readonly server_time: string;
  };
}

export interface ErrorEnvelope {
  readonly v: typeof PROTOCOL_VERSION;
  readonly id: string;
  readonly type: 'error';
  readonly payload: {
    readonly code: 'INVALID_ENVELOPE' | 'HELLO_REQUIRED' | 'ALREADY_INITIALIZED' | 'UNSUPPORTED_EVENT' | 'RATE_LIMITED' | 'BACKPRESSURE';
    readonly message: string;
    readonly reply_to?: string;
    readonly retryable: boolean;
  };
}

export type ServerEnvelope = ConnectionReadyEnvelope | PongEnvelope | ErrorEnvelope;

export function parseClientEnvelope(raw: string): ClientEnvelope | null {
  try {
    const value: unknown = JSON.parse(raw);
    const result = clientEnvelopeSchema.safeParse(value);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function clientKind(value: ClientEnvelope): RealtimeClientKind | null {
  return value.type === 'client.hello' ? value.payload.client : null;
}
