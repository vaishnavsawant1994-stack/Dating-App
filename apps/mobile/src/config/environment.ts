export const mobileEnvironments = [
  'local',
  'test',
  'preview',
  'staging',
  'sandbox',
  'production',
] as const;

export type MobileEnvironment = (typeof mobileEnvironments)[number];
export type MobilePlatform = 'ios' | 'android';

export interface MobilePublicConfig {
  readonly environment: MobileEnvironment;
  readonly apiBaseUrl: string;
  readonly appVersion: string;
}

export function parseMobileEnvironment(value: string | undefined): MobileEnvironment {
  const candidate = value ?? 'local';
  if (!mobileEnvironments.includes(candidate as MobileEnvironment)) {
    throw new Error(`Unsupported mobile environment: ${candidate}`);
  }
  return candidate as MobileEnvironment;
}

export function resolveMobileApiBaseUrl(input: {
  readonly configured?: string | undefined;
  readonly platform: MobilePlatform;
}): string {
  const configured = input.configured?.trim();
  const fallback = input.platform === 'android' ? 'http://10.0.2.2:3000' : 'http://127.0.0.1:3000';
  const candidate = configured === undefined || configured.length === 0 ? fallback : configured;
  const url = new URL(candidate);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must use http or https.');
  }
  return url.toString().replace(/\/$/, '');
}

export function createMobilePublicConfig(input: {
  readonly environment?: string | undefined;
  readonly configuredApiBaseUrl?: string | undefined;
  readonly platform: MobilePlatform;
}): MobilePublicConfig {
  return {
    environment: parseMobileEnvironment(input.environment),
    apiBaseUrl: resolveMobileApiBaseUrl({
      configured: input.configuredApiBaseUrl,
      platform: input.platform,
    }),
    appVersion: '0.0.0',
  };
}
