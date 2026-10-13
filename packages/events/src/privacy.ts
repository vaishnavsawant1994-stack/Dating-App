const prohibitedBroadEventKeys = new Set([
  'authorization',
  'password',
  'access_token',
  'refresh_token',
  'secret',
  'email',
  'phone',
  'precise_location',
  'message_content',
  'government_id',
  'bank_account',
  'tax_id',
]);

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replaceAll('-', '_');
}

export function findProhibitedEventPayloadKeys(value: unknown, path = '$'): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findProhibitedEventPayloadKeys(item, `${path}[${index}]`));
  }

  if (value === null || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value).flatMap(([key, child]) => {
    const currentPath = `${path}.${key}`;
    const direct = prohibitedBroadEventKeys.has(normalizeKey(key)) ? [currentPath] : [];
    return [...direct, ...findProhibitedEventPayloadKeys(child, currentPath)];
  });
}

export function assertBroadEventPayloadSafe(value: unknown): void {
  const violations = findProhibitedEventPayloadKeys(value);
  if (violations.length > 0) {
    throw new Error(`Broad domain event payload contains prohibited data at: ${violations.join(', ')}`);
  }
}
