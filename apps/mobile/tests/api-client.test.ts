import { describe, expect, it, vi } from 'vitest';
import { createMobileApiClient } from '../src/network/api-client';
import { MobileApiError } from '../src/network/api-error';

function client(fetchImpl: typeof fetch) {
  let counter = 0;
  return createMobileApiClient({
    baseUrl: 'https://api.example.test',
    platform: 'ios',
    clientVersion: '0.0.0',
    fetchImpl,
    requestIdFactory: () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`,
    timeoutMs: 100,
  });
}

describe('mobile API client', () => {
  it('adds request/client/platform headers', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (_input, init) => {
      const headers = new Headers(init?.headers);
      expect(headers.get('x-client-version')).toBe('0.0.0');
      expect(headers.get('x-platform')).toBe('ios');
      expect(headers.get('x-request-id')).toMatch(/^00000000-/);
      return new Response('{}', { status: 200 });
    });

    await client(fetchImpl).request('/health/live');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries one safe GET after a retryable server error', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: 'TEMPORARILY_UNAVAILABLE', message: 'Try later', retryable: true } }), { status: 503, headers: { 'content-type': 'application/json' } }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));

    const response = await client(fetchImpl).request('/health/ready');
    expect(response.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('never retries unsafe POST automatically', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () =>
      new Response(JSON.stringify({ error: { code: 'TEMPORARILY_UNAVAILABLE', message: 'Try later', retryable: true } }), { status: 503, headers: { 'content-type': 'application/json' } }),
    );

    await expect(client(fetchImpl).request('/v1/example', { method: 'POST', body: '{}' })).rejects.toBeInstanceOf(MobileApiError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('rejects absolute paths so callers cannot bypass the configured API origin', async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    await expect(client(fetchImpl).request('https://evil.example')).rejects.toMatchObject({ code: 'INVALID_PATH' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
