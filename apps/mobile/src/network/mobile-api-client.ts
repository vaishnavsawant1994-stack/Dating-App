import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { createMobilePublicConfig } from '../config/environment';
import { createMobileApiClient } from './api-client';

function currentPlatform(): 'ios' | 'android' {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS;
  }
  throw new Error(`Unsupported together mobile platform: ${Platform.OS}`);
}

export function createRuntimeMobileApiClient() {
  const platform = currentPlatform();
  const config = createMobilePublicConfig({
    environment: process.env.EXPO_PUBLIC_APP_ENV,
    configuredApiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    platform,
  });

  return {
    config,
    client: createMobileApiClient({
      baseUrl: config.apiBaseUrl,
      platform,
      clientVersion: config.appVersion,
      requestIdFactory: () => Crypto.randomUUID(),
    }),
  };
}
