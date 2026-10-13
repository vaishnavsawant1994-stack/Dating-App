import { describe, expect, it } from 'vitest';
import { decideAdminAccess } from '../../lib/access';
import {
  acceptsAdminAudience,
  adminApiBaseUrl,
  ADMIN_AUTH_AUDIENCE,
  CONSUMER_AUTH_AUDIENCE,
} from '../../lib/config';
import { adminCapabilities, navigationForCapabilities } from '../../lib/permissions';

describe('Admin boundary', () => {
  it('accepts only the dedicated Admin auth audience', () => {
    expect(acceptsAdminAudience(ADMIN_AUTH_AUDIENCE)).toBe(true);
    expect(acceptsAdminAudience(CONSUMER_AUTH_AUDIENCE)).toBe(false);
    expect(acceptsAdminAudience([ADMIN_AUTH_AUDIENCE, CONSUMER_AUTH_AUDIENCE])).toBe(false);
  });

  it('never allows preview mode in production', () => {
    expect(decideAdminAccess({ environment: 'production', previewEnabled: true })).toEqual({
      allowed: false,
      reason: 'PREVIEW_DISABLED',
    });
  });

  it('allows non-production preview without pretending it is authenticated', () => {
    expect(decideAdminAccess({ environment: 'test', previewEnabled: true })).toEqual({
      allowed: true,
      mode: 'preview',
    });
  });

  it('rejects a consumer session audience at the Admin boundary', () => {
    expect(
      decideAdminAccess({
        environment: 'staging',
        previewEnabled: false,
        sessionAudience: CONSUMER_AUTH_AUDIENCE,
      }),
    ).toEqual({ allowed: false, reason: 'WRONG_AUDIENCE' });
  });

  it('rejects sharing the consumer API origin', () => {
    expect(() =>
      adminApiBaseUrl({
        NEXT_PUBLIC_ADMIN_API_BASE_URL: 'https://api.example.test',
        NEXT_PUBLIC_API_BASE_URL: 'https://api.example.test/',
      }),
    ).toThrow('Admin API must not share the consumer API origin.');
  });

  it('shows only navigation backed by explicit capabilities', () => {
    const navigation = navigationForCapabilities(new Set([adminCapabilities[0], adminCapabilities[3]]));
    expect(navigation.map((item) => item.label)).toEqual(['Overview', 'Reports']);
  });
});
