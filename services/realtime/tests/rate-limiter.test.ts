import { describe, expect, it } from 'vitest';
import { FixedWindowRateLimiter } from '../src/rate-limiter.js';

describe('FixedWindowRateLimiter', () => {
  it('limits messages within a window and resets on the next window', () => {
    const limiter = new FixedWindowRateLimiter(2, 1_000, 10_000);
    expect(limiter.allow(10_000)).toBe(true);
    expect(limiter.allow(10_100)).toBe(true);
    expect(limiter.allow(10_200)).toBe(false);
    expect(limiter.allow(11_000)).toBe(true);
  });
});
