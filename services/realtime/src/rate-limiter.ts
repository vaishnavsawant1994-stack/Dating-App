export class FixedWindowRateLimiter {
  private windowStartedAt: number;
  private count = 0;

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    now: number,
  ) {
    this.windowStartedAt = now;
  }

  allow(now: number): boolean {
    if (now - this.windowStartedAt >= this.windowMs) {
      this.windowStartedAt = now;
      this.count = 0;
    }

    this.count += 1;
    return this.count <= this.limit;
  }
}
