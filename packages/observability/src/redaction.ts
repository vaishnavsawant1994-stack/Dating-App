const sensitiveKeys = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'password',
  'token',
  'secret',
  'api_key',
  'apikey',
  'refresh_token',
  'access_token',
  'precise_location',
  'message_content',
  'bank_account',
  'government_id',
  'ai_private_memory',
]);

export const REDACTED_VALUE = '[REDACTED]';

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replaceAll('-', '_');
}

export function isSensitiveKey(key: string): boolean {
  return sensitiveKeys.has(normalizeKey(key));
}

export function redactSensitiveRecord(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveRecord(item));
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      isSensitiveKey(key) ? REDACTED_VALUE : redactSensitiveRecord(child),
    ]),
  );
}

export const pinoRedactionPaths = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
  'password',
  'token',
  'secret',
  'api_key',
  'refresh_token',
  'access_token',
  'precise_location',
  'message_content',
  'bank_account',
  'government_id',
  'ai_private_memory',
] as const;
