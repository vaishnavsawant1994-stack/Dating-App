import { createHash, timingSafeEqual } from 'node:crypto';

function digest(value: string | Buffer): Buffer {
  return createHash('sha256').update(value).digest();
}

export function secureEqual(left: string | Buffer, right: string | Buffer): boolean {
  return timingSafeEqual(digest(left), digest(right));
}
