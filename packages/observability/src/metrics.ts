export interface Counter {
  add(value: number, attributes?: Readonly<Record<string, string | number | boolean>>): void;
}

export interface Histogram {
  record(value: number, attributes?: Readonly<Record<string, string | number | boolean>>): void;
}

const noOpCounter: Counter = { add: () => undefined };
const noOpHistogram: Histogram = { record: () => undefined };

export interface Metrics {
  readonly requests: Counter;
  readonly requestDurationMs: Histogram;
  readonly dependencyFailures: Counter;
}

export function createNoOpMetrics(): Metrics {
  return {
    requests: noOpCounter,
    requestDurationMs: noOpHistogram,
    dependencyFailures: noOpCounter,
  };
}
