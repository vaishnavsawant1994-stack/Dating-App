import * as SecureStore from 'expo-secure-store';
import { assertSecureStorageKey, assertSecureStorageValue } from './policy';

export async function getSecureItem(key: string): Promise<string | null> {
  assertSecureStorageKey(key);
  return SecureStore.getItemAsync(key);
}

export async function setSecureItem(key: string, value: string): Promise<void> {
  assertSecureStorageKey(key);
  assertSecureStorageValue(value);
  await SecureStore.setItemAsync(key, value);
}

export async function deleteSecureItem(key: string): Promise<void> {
  assertSecureStorageKey(key);
  await SecureStore.deleteItemAsync(key);
}
