import { describe, expect, it } from 'vitest';
import { apiBaseUrl } from '../../lib/api/config.js';

describe('web public API configuration', () => {
  it('uses a safe local default', () => {
    expect(apiBaseUrl({})).toBe('http://127.0.0.1:3000');
  });

  it('accepts an explicit public HTTPS origin', () => {
    expect(apiBaseUrl({ NEXT_PUBLIC_API_BASE_URL: 'https://api.example.test/' })).toBe(
      'https://api.example.test',
    );
  });

  it('rejects non-http public endpoints', () => {
    expect(() => apiBaseUrl({ NEXT_PUBLIC_API_BASE_URL: 'file:///secret' })).toThrow();
  });
});
