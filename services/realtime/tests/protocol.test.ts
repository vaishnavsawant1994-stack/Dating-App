import { describe, expect, it } from 'vitest';
import { AUTH_PROTOCOL_PREFIX, REALTIME_PROTOCOL, containsForbiddenCredentialQuery, encodeAuthProtocol, parseRealtimeProtocols } from '../src/auth.js';
import { parseClientEnvelope } from '../src/protocol.js';

describe('realtime authentication protocols', () => {
  it('round-trips a token without putting it in the URL', () => {
    const authProtocol = encodeAuthProtocol('header.payload.signature');
    expect(authProtocol.startsWith(AUTH_PROTOCOL_PREFIX)).toBe(true);
    expect(parseRealtimeProtocols(`${REALTIME_PROTOCOL}, ${authProtocol}`)).toEqual({ token: 'header.payload.signature' });
  });

  it('rejects missing, duplicate, malformed, and incomplete protocols', () => {
    const authProtocol = encodeAuthProtocol('token');
    expect(parseRealtimeProtocols(undefined)).toBeNull();
    expect(parseRealtimeProtocols(REALTIME_PROTOCOL)).toBeNull();
    expect(parseRealtimeProtocols(`${REALTIME_PROTOCOL}, ${authProtocol}, ${authProtocol}`)).toBeNull();
    expect(parseRealtimeProtocols(`${REALTIME_PROTOCOL}, ${AUTH_PROTOCOL_PREFIX}%%%`)).toBeNull();
  });

  it('detects credential-bearing realtime URLs case-insensitively', () => {
    expect(containsForbiddenCredentialQuery('/v1/realtime?token=secret')).toBe(true);
    expect(containsForbiddenCredentialQuery('/v1/realtime?access_token=secret')).toBe(true);
    expect(containsForbiddenCredentialQuery('/v1/realtime?Authorization=secret')).toBe(true);
    expect(containsForbiddenCredentialQuery('/v1/realtime?room=abc')).toBe(false);
  });
});

describe('realtime protocol envelopes', () => {
  it('accepts versioned hello and ping messages only', () => {
    expect(parseClientEnvelope(JSON.stringify({
      v: 1,
      id: 'message-0001',
      type: 'client.hello',
      payload: { client: 'web', client_version: '0.0.0' },
    }))?.type).toBe('client.hello');

    expect(parseClientEnvelope(JSON.stringify({
      v: 1,
      id: 'message-0002',
      type: 'client.ping',
      payload: { nonce: 'abc' },
    }))?.type).toBe('client.ping');

    expect(parseClientEnvelope('{not-json')).toBeNull();
    expect(parseClientEnvelope(JSON.stringify({ v: 2, id: 'message-0003', type: 'client.ping', payload: {} }))).toBeNull();
    expect(parseClientEnvelope(JSON.stringify({ v: 1, id: 'message-0004', type: 'message.send', payload: {} }))).toBeNull();
  });
});
