import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { mobileColors } from '../theme/theme';

export interface MobileButtonProps extends Omit<PressableProps, 'children'> {
  readonly label: string;
  readonly variant?: 'primary' | 'secondary';
}

export function MobileButton({ label, variant = 'primary', disabled, style, ...props }: MobileButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? label}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        typeof style === 'function' ? style({ pressed }) : style,
      ]}
      {...props}
    >
      <Text allowFontScaling style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primary: { backgroundColor: mobileColors.primary, borderColor: mobileColors.primary },
  secondary: { backgroundColor: mobileColors.surface, borderColor: mobileColors.border },
  primaryText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  secondaryText: { color: mobileColors.text, fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.5 },
});
