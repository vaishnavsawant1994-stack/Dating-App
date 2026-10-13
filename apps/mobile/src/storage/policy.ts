const keyPattern = /^[a-z0-9][a-z0-9._:-]{0,63}$/;
export const MAX_SECURE_VALUE_BYTES = 2048;

export function assertSecureStorageKey(key: string): void {
  if (!keyPattern.test(key)) {
    throw new Error('Secure-storage keys must be 1-64 lowercase ASCII characters using . _ : or -.');
  }
}

export function assertSecureStorageValue(value: string): void {
  if (new TextEncoder().encode(value).byteLength > MAX_SECURE_VALUE_BYTES) {
    throw new Error(`Secure-storage values must not exceed ${MAX_SECURE_VALUE_BYTES} bytes.`);
  }
}
