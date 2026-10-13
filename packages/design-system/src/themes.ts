import { color } from './tokens/color';

export const lightTheme = {
  canvas: color.cream,
  surface: color.white,
  surfaceSelected: color.rose100,
  text: color.ink,
  textMuted: color.muted,
  border: color.border,
  primary: color.rose700,
  primaryStrong: color.rose700,
  success: color.success,
} as const;

export const darkTheme = {
  canvas: color.darkCanvas,
  surface: color.darkSurface,
  surfaceSelected: '#3a2430',
  text: color.darkText,
  textMuted: color.darkMuted,
  border: color.darkBorder,
  primary: color.rose300,
  primaryStrong: '#ffd6e1',
  success: '#75cda9',
} as const;
