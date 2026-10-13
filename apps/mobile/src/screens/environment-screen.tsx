import { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createMobilePublicConfig } from '../config/environment';
import { mobileColors } from '../theme/theme';

function runtimePlatform(): 'ios' | 'android' {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS;
  }
  throw new Error(`Unsupported together mobile platform: ${Platform.OS}`);
}

export function EnvironmentScreen() {
  const config = useMemo(
    () => createMobilePublicConfig({
      environment: process.env.EXPO_PUBLIC_APP_ENV,
      configuredApiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
      platform: runtimePlatform(),
    }),
    [],
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text allowFontScaling style={styles.note}>
          Only explicitly public runtime values appear here. Tokens, credentials, and private configuration never belong in EXPO_PUBLIC_* variables.
        </Text>
        {[
          ['Environment', config.environment],
          ['Platform', Platform.OS],
          ['App version', config.appVersion],
          ['API base URL', config.apiBaseUrl],
        ].map(([label, value]) => (
          <View key={label} style={styles.row} accessible accessibilityLabel={`${label}: ${value}`}>
            <Text allowFontScaling style={styles.label}>{label}</Text>
            <Text allowFontScaling selectable style={styles.value}>{value}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: mobileColors.canvas },
  container: { padding: 18, gap: 12 },
  note: { color: mobileColors.muted, fontSize: 15, lineHeight: 22, marginBottom: 6 },
  row: { backgroundColor: mobileColors.surface, borderWidth: 1, borderColor: mobileColors.border, borderRadius: 18, padding: 16, gap: 4 },
  label: { color: mobileColors.muted, fontSize: 13, fontWeight: '700' },
  value: { color: mobileColors.text, fontSize: 16, lineHeight: 22 },
});
