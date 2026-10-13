import { createHmac } from 'node:crypto';
import { secureEqual } from './timing-safe.js';

export function createHmacSha256Signature(payload: string | Buffer, secret: string): string {
  if (secret.length < 16) {
    throw new Error('Webhook secret is too short.');
  }

  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyHmacSha256Signature(
  payload: string | Buffer,
  signature: string,
  secret: string,
): boolean {
  const expected = createHmacSha256Signature(payload, secret);
  return secureEqual(expected, signature);
}
