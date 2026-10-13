import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MobileButton } from '../components/mobile-button';
import { mobileColors } from '../theme/theme';
import { type RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.mark} accessibilityLabel="together logo" accessibilityRole="image">
          <Text allowFontScaling={false} style={styles.markText}>♥</Text>
        </View>
        <Text allowFontScaling accessibilityRole="header" style={styles.brand}>together</Text>
        <Text allowFontScaling style={styles.tagline}>Real people. Brighter connections.</Text>
        <Text allowFontScaling style={styles.detail}>
          Stage 0 mobile engineering shell. Dating, discovery, and messaging experiences are intentionally not implemented yet.
        </Text>
        <MobileButton label="Open system status" onPress={() => navigation.navigate('SystemStatus')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: mobileColors.canvas },
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  mark: {
    width: 58,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: mobileColors.selected,
  },
  markText: { color: mobileColors.primary, fontSize: 30 },
  brand: { color: mobileColors.primary, fontSize: 38, lineHeight: 44, fontWeight: '900', letterSpacing: -1.2 },
  tagline: { color: mobileColors.text, fontSize: 22, lineHeight: 29, fontWeight: '700' },
  detail: { color: mobileColors.muted, fontSize: 16, lineHeight: 24, marginBottom: 12 },
});
