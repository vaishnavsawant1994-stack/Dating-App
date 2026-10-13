import { describe, expect, it } from 'vitest';
import { assertSecureStorageKey, assertSecureStorageValue, MAX_SECURE_VALUE_BYTES } from '../src/storage/policy';

describe('mobile secure storage policy', () => {
  it('accepts namespaced secret keys', () => {
    expect(() => assertSecureStorageKey('auth.refresh_token')).not.toThrow();
  });

  it('rejects unsafe or oversized keys and values', () => {
    expect(() => assertSecureStorageKey('../token')).toThrow();
    expect(() => assertSecureStorageKey('UPPERCASE')).toThrow();
    expect(() => assertSecureStorageValue('x'.repeat(MAX_SECURE_VALUE_BYTES + 1))).toThrow();
  });
});
