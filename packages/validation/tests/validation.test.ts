import { describe, expect, it } from 'vitest';
import {
  CursorPaginationSchema,
  CurrencyCodeSchema,
  IdempotencyKeySchema,
  UuidSchema,
} from '../src/index.js';

describe('@together/validation', () => {
  it('accepts opaque UUID resource identifiers', () => {
    expect(UuidSchema.parse('123e4567-e89b-42d3-a456-426614174000')).toBe(
      '123e4567-e89b-42d3-a456-426614174000',
    );
  });

  it('bounds cursor pagination', () => {
    expect(CursorPaginationSchema.parse({ limit: '30' })).toEqual({ limit: 30 });
    expect(() => CursorPaginationSchema.parse({ limit: 101 })).toThrow();
  });

  it('rejects malformed idempotency and currency values', () => {
    expect(() => IdempotencyKeySchema.parse('bad key')).toThrow();
    expect(() => CurrencyCodeSchema.parse('usd')).toThrow();
  });
});
