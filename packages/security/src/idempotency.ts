import { randomUUID } from 'node:crypto';

const idempotencyPattern = /^[A-Za-z0-9._:-]{8,200}$/;

export function createIdempotencyKey(namespace?: string): string {
  const id = randomUUID();
  return namespace === undefined ? id : `${namespace}:${id}`;
}

export function isValidIdempotencyKey(value: string): boolean {
  return idempotencyPattern.test(value);
}
