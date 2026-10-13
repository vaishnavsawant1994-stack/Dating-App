import { describe, expect, it } from 'vitest';
import { loadAiConfig } from '../src/config.js';

describe('AI configuration', () => {
  it('uses fake provider only in local/test/sandbox by default', () => {
    expect(loadAiConfig({ APP_ENV: 'test' }).providerName).toBe('fake');
    expect(loadAiConfig({ APP_ENV: 'sandbox' }).providerName).toBe('fake');
    expect(loadAiConfig({ APP_ENV: 'production' }).providerName).toBe('disabled');
  });

  it('fails closed if fake provider is explicitly configured for production', () => {
    expect(() => loadAiConfig({ APP_ENV: 'production', AI_PROVIDER: 'fake' })).toThrow(/forbidden/i);
  });
});
