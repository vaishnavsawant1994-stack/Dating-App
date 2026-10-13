import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { mobileColors } from '../theme/theme';

export interface StatusCardProps extends ViewProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly detail: string;
}

export function StatusCard({ eyebrow, title, detail, style, ...props }: StatusCardProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      <Text allowFontScaling style={styles.eyebrow}>{eyebrow}</Text>
      <Text allowFontScaling accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text allowFontScaling style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: mobileColors.border,
    backgroundColor: mobileColors.surface,
    borderRadius: 20,
    padding: 18,
    gap: 6,
  },
  eyebrow: {
    color: mobileColors.primary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: { color: mobileColors.text, fontSize: 20, lineHeight: 26, fontWeight: '800' },
  detail: { color: mobileColors.muted, fontSize: 15, lineHeight: 22 },
});
