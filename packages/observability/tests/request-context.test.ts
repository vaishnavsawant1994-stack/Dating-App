import { describe, expect, it } from 'vitest';
import {
  createTraceId,
  getRequestContext,
  runWithRequestContext,
  traceIdFromTraceParent,
} from '../src/index.js';

describe('@together/observability request context', () => {
  it('creates W3C-width trace identifiers', () => {
    expect(createTraceId()).toMatch(/^[0-9a-f]{32}$/);
  });

  it('extracts non-zero W3C trace IDs', () => {
    expect(traceIdFromTraceParent('00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01')).toBe(
      '4bf92f3577b34da6a3ce929d0e0e4736',
    );
    expect(traceIdFromTraceParent('00-00000000000000000000000000000000-00f067aa0ba902b7-01')).toBeUndefined();
  });

  it('propagates scoped request context through asynchronous work', async () => {
    await runWithRequestContext({ requestId: 'request-1', traceId: 'trace-1' }, async () => {
      await Promise.resolve();
      expect(getRequestContext()).toEqual({ requestId: 'request-1', traceId: 'trace-1' });
    });
  });
});
