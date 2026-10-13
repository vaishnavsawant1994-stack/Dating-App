function normalize(hex: string): string {
  const value = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(value)) {
    throw new Error(`Expected six-digit hexadecimal color, received: ${hex}`);
  }
  return value;
}

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  const normalized = normalize(hex);
  const r = channel(Number.parseInt(normalized.slice(0, 2), 16));
  const g = channel(Number.parseInt(normalized.slice(2, 4), 16));
  const b = channel(Number.parseInt(normalized.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(foreground: string, background: string): number {
  const first = relativeLuminance(foreground);
  const second = relativeLuminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWcagAaText(foreground: string, background: string): boolean {
  return contrastRatio(foreground, background) >= 4.5;
}
