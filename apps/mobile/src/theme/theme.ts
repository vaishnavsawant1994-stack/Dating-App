import { color } from '@together/design-system/tokens';
import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { Appearance } from 'react-native';

export const mobileColors = {
  canvas: color.cream,
  surface: color.white,
  selected: color.rose100,
  text: color.ink,
  muted: color.muted,
  border: color.border,
  primary: color.rose700,
  success: color.success,
  danger: color.danger,
  darkCanvas: color.darkCanvas,
  darkSurface: color.darkSurface,
  darkText: color.darkText,
  darkMuted: color.darkMuted,
  darkBorder: color.darkBorder,
} as const;

function createNavigationTheme(dark: boolean): Theme {
  const base = dark ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark,
    colors: {
      ...base.colors,
      primary: dark ? color.rose300 : color.rose700,
      background: dark ? color.darkCanvas : color.cream,
      card: dark ? color.darkSurface : color.white,
      text: dark ? color.darkText : color.ink,
      border: dark ? color.darkBorder : color.border,
      notification: dark ? color.rose300 : color.rose700,
    },
  };
}

export const navigationTheme = createNavigationTheme(Appearance.getColorScheme() === 'dark');
