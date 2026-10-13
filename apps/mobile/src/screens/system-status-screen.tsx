import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MobileButton } from '../components/mobile-button';
import { StatusCard } from '../components/status-card';
import { type RootStackParamList } from '../navigation/types';
import { createRuntimeMobileApiClient } from '../network/mobile-api-client';
import { useNetworkStatus } from '../network/network-provider';
import { mobileColors } from '../theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SystemStatus'>;

type ApiState = 'idle' | 'checking' | 'ready' | 'unavailable';

export function SystemStatusScreen({ navigation }: Props) {
  const network = useNetworkStatus();
  const runtime = useMemo(() => createRuntimeMobileApiClient(), []);
  const [apiState, setApiState] = useState<ApiState>('idle');

  const checkApi = async () => {
    setApiState('checking');
    try {
      await runtime.client.request('/health/ready');
      setApiState('ready');
    } catch {
      setApiState('unavailable');
    }
  };

  const networkDetail = network.connected === null
    ? 'Connection state has not been observed yet.'
    : network.connected
      ? `Connected via ${network.type}.`
      : 'No network connection is currently available.';

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusCard eyebrow="Network" title={network.connected ? 'Connected' : 'Connection status'} detail={networkDetail} />
        <StatusCard
          eyebrow="Core API"
          title={apiState === 'ready' ? 'Ready' : apiState === 'unavailable' ? 'Unavailable' : 'Not checked'}
          detail={`Endpoint: ${runtime.config.apiBaseUrl}`}
        />
        <View style={styles.actions}>
          <MobileButton
            label={apiState === 'checking' ? 'Checking…' : 'Check core API'}
            disabled={apiState === 'checking'}
            onPress={() => void checkApi()}
          />
          <MobileButton label="View environment" variant="secondary" onPress={() => navigation.navigate('Environment')} />
        </View>
        <Text allowFontScaling style={styles.platform}>Platform: {Platform.OS}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: mobileColors.canvas },
  container: { padding: 18, gap: 14 },
  actions: { gap: 10 },
  platform: { color: mobileColors.muted, fontSize: 13, textAlign: 'center' },
});
