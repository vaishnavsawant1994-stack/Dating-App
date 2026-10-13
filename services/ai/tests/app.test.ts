import { describe, expect, it } from 'vitest';
import { buildAiApp } from '../src/app.js';
import { FakeAiProvider } from '../src/fake-provider.js';
import { type AiAccessAuthorizer, type AiConfig } from '../src/types.js';

const config: AiConfig = {
  environment: 'test',
  serviceName: 'ai',
  host: '127.0.0.1',
  port: 0,
  logging: false,
  logLevel: 'error',
  providerName: 'fake',
  maxInputChars: 1_000,
  maxOutputTokens: 100,
  bodyLimitBytes: 64_000,
};

const allow: AiAccessAuthorizer = {
  isReady: () => true,
  authorize: async () => true,
};

describe('AI application', () => {
  it('separates liveness from authorization/provider readiness', async () => {
    const app = await buildAiApp(config, {
      provider: new FakeAiProvider(),
      authorizer: { isReady: () => false, authorize: async () => false },
    });
    await app.ready();
    expect((await app.inject({ method: 'GET', url: '/health/live' })).statusCode).toBe(200);
    expect((await app.inject({ method: 'GET', url: '/health/ready' })).statusCode).toBe(503);
    await app.close();
  });

  it('executes only versioned, validated, and authorized requests', async () => {
    const app = await buildAiApp(config, { provider: new FakeAiProvider(), authorizer: allow, createRequestId: () => 'request-0001' });
    await app.ready();
    const response = await app.inject({
      method: 'POST',
      url: '/v1/ai/execute',
      payload: { v: 1, operation: 'classify', purpose: 'test classification', payload: { input: 'hello', labels: ['a', 'b'] } },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ v: 1, request_id: 'request-0001', provider: 'fake', synthetic: true, operation: 'classify' });

    const unversioned = await app.inject({
      method: 'POST',
      url: '/v1/ai/execute',
      payload: { operation: 'classify', purpose: 'test classification', payload: { input: 'hello', labels: ['a', 'b'] } },
    });
    expect(unversioned.statusCode).toBe(400);
    await app.close();
  });

  it('denies unauthorized requests and enforces input/output bounds', async () => {
    const denied = await buildAiApp(config, {
      provider: new FakeAiProvider(),
      authorizer: { isReady: () => true, authorize: async () => false },
    });
    await denied.ready();
    const denial = await denied.inject({
      method: 'POST', url: '/v1/ai/execute',
      payload: { v: 1, operation: 'generate', purpose: 'test generation', payload: { prompt: 'hello' } },
    });
    expect(denial.statusCode).toBe(403);
    await denied.close();

    const bounded = await buildAiApp(config, { provider: new FakeAiProvider(), authorizer: allow });
    await bounded.ready();
    const tooLarge = await bounded.inject({
      method: 'POST', url: '/v1/ai/execute',
      payload: { v: 1, operation: 'generate', purpose: 'test generation', payload: { prompt: 'x'.repeat(1_001) } },
    });
    expect(tooLarge.statusCode).toBe(413);
    const tooManyTokens = await bounded.inject({
      method: 'POST', url: '/v1/ai/execute',
      payload: { v: 1, operation: 'generate', purpose: 'test generation', payload: { prompt: 'hello', max_output_tokens: 101 } },
    });
    expect(tooManyTokens.statusCode).toBe(400);
    await bounded.close();
  });
});
