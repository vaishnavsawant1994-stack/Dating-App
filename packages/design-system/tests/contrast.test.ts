import { describe, expect, it } from 'vitest';
import { color, contrastRatio, meetsWcagAaText } from '../src/index.js';

describe('@together/design-system contrast', () => {
  it('keeps core body text above WCAG AA on the light canvas', () => {
    expect(meetsWcagAaText(color.ink, color.cream)).toBe(true);
    expect(contrastRatio(color.ink, color.cream)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps dark-theme body text above WCAG AA', () => {
    expect(meetsWcagAaText(color.darkText, color.darkCanvas)).toBe(true);
  });

  it('keeps primary interactive rose surfaces readable with white text', () => {
    expect(meetsWcagAaText(color.white, color.rose700)).toBe(true);
    expect(contrastRatio(color.white, color.rose700)).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps verification green readable on selected pale-rose surfaces', () => {
    expect(meetsWcagAaText(color.success, color.rose100)).toBe(true);
    expect(contrastRatio(color.success, color.rose100)).toBeGreaterThanOrEqual(4.5);
  });
});
