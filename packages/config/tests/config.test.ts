import { describe, expect, it } from 'vitest';
import {
  BaseServerEnvironmentSchema,
  createServiceIdentity,
  parseEnvironment,
  pickPublicEnvironment,
} from '../src/index.js';

describe('@together/config', () => {
  it('parses a typed server environment', () => {
    const result = parseEnvironment(BaseServerEnvironmentSchema, {
      APP_ENV: 'sandbox',
      SERVICE_NAME: 'api',
      LOG_LEVEL: 'debug',
    });

    expect(result.APP_ENV).toBe('sandbox');
    expect(result.SERVICE_NAME).toBe('api');
  });

  it('rejects unsupported environments', () => {
    expect(() =>
      createServiceIdentity({ name: 'api', environment: 'mystery-environment' }),
    ).toThrow();
  });

  it('only exposes explicitly public client variables', () => {
    expect(
      pickPublicEnvironment({
        NEXT_PUBLIC_API_URL: 'https://example.test',
        EXPO_PUBLIC_API_URL: 'https://mobile.example.test',
        DATABASE_URL: 'postgres://secret',
      }),
    ).toEqual({
      NEXT_PUBLIC_API_URL: 'https://example.test',
      EXPO_PUBLIC_API_URL: 'https://mobile.example.test',
    });
  });
});
