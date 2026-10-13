import { describe, expect, it } from 'vitest';
import { createMobilePublicConfig, resolveMobileApiBaseUrl } from '../src/config/environment';

describe('mobile public configuration', () => {
  it('uses emulator-safe local API defaults', () => {
    expect(resolveMobileApiBaseUrl({ platform: 'ios' })).toBe('http://127.0.0.1:3000');
    expect(resolveMobileApiBaseUrl({ platform: 'android' })).toBe('http://10.0.2.2:3000');
  });

  it('accepts only HTTP(S) public API endpoints', () => {
    expect(resolveMobileApiBaseUrl({ platform: 'ios', configured: 'https://api.example.test/' })).toBe('https://api.example.test');
    expect(() => resolveMobileApiBaseUrl({ platform: 'ios', configured: 'file:///private' })).toThrow();
  });

  it('rejects unknown environments', () => {
    expect(() => createMobilePublicConfig({ environment: 'mystery', platform: 'ios' })).toThrow();
  });
});
