export const sensitiveHeaderNames = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'proxy-authorization',
  'x-api-key',
]);

export function redactHeaders(headers: Readonly<Record<string, unknown>>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      sensitiveHeaderNames.has(key.toLowerCase()) ? '[REDACTED]' : value,
    ]),
  );
}
