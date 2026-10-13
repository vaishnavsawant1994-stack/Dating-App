export const ADMIN_AUTH_AUDIENCE = 'together-admin' as const;
export const CONSUMER_AUTH_AUDIENCE = 'together-consumer' as const;

const localAdminApiBaseUrl = 'http://127.0.0.1:3005';

function normalizeHttpOrigin(value: string, name: string): string {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${name} must use http or https.`);
  }
  return url.toString().replace(/\/$/, '');
}

export function adminApiBaseUrl(
  source: Readonly<Record<string, string | undefined>> = process.env,
): string {
  const admin = normalizeHttpOrigin(
    source.NEXT_PUBLIC_ADMIN_API_BASE_URL?.trim() || localAdminApiBaseUrl,
    'NEXT_PUBLIC_ADMIN_API_BASE_URL',
  );
  const consumerCandidate = source.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (consumerCandidate !== undefined && consumerCandidate.length > 0) {
    const consumer = normalizeHttpOrigin(consumerCandidate, 'NEXT_PUBLIC_API_BASE_URL');
    if (admin === consumer) {
      throw new Error('Admin API must not share the consumer API origin.');
    }
  }
  return admin;
}

export function acceptsAdminAudience(audience: string | readonly string[]): boolean {
  return typeof audience === 'string'
    ? audience === ADMIN_AUTH_AUDIENCE
    : audience.length === 1 && audience[0] === ADMIN_AUTH_AUDIENCE;
}
