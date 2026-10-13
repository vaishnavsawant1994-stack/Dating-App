import { describe, expect, it } from 'vitest';
import {
  createHmacSha256Signature,
  createSecureToken,
  isValidIdempotencyKey,
  redactHeaders,
  secureEqual,
  verifyHmacSha256Signature,
} from '../src/index.js';

describe('@together/security', () => {
  it('creates high-entropy URL-safe tokens', () => {
    const token = createSecureToken();
    expect(token.length).toBeGreaterThan(30);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('compares secrets without requiring equal source lengths', () => {
    expect(secureEqual('same-value', 'same-value')).toBe(true);
    expect(secureEqual('short', 'a much longer value')).toBe(false);
  });

  it('signs and verifies HMAC webhook payloads', () => {
    const secret = 'a-test-secret-that-is-long-enough';
    const signature = createHmacSha256Signature('payload', secret);
    expect(verifyHmacSha256Signature('payload', signature, secret)).toBe(true);
    expect(verifyHmacSha256Signature('changed', signature, secret)).toBe(false);
  });

  it('redacts security-sensitive headers', () => {
    expect(
      redactHeaders({ Authorization: 'Bearer secret', 'x-request-id': 'visible-request' }),
    ).toEqual({ Authorization: '[REDACTED]', 'x-request-id': 'visible-request' });
  });

  it('validates idempotency-key shape', () => {
    expect(isValidIdempotencyKey('gift:12345678')).toBe(true);
    expect(isValidIdempotencyKey('bad key')).toBe(false);
  });
});
