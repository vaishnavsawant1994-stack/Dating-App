import { randomBytes, randomUUID } from 'node:crypto';

export function createSecureId(): string {
  return randomUUID();
}

export function createSecureToken(bytes = 32): string {
  if (!Number.isInteger(bytes) || bytes < 16 || bytes > 1024) {
    throw new RangeError('Token byte length must be an integer between 16 and 1024.');
  }

  return randomBytes(bytes).toString('base64url');
}
