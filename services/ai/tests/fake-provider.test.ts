import { describe, expect, it } from 'vitest';
import { FakeAiProvider } from '../src/fake-provider.js';

describe('FakeAiProvider', () => {
  it('returns deterministic synthetic embeddings', async () => {
    const provider = new FakeAiProvider();
    const request = { operation: 'embed', purpose: 'test embedding', payload: { input: 'hello' } } as const;
    const first = await provider.execute(request);
    const second = await provider.execute(request);
    expect(first).toEqual(second);
    expect(provider.synthetic).toBe(true);
  });

  it('marks fake moderation as synthetic rather than pretending to be real moderation', async () => {
    const provider = new FakeAiProvider();
    const result = await provider.execute({ operation: 'moderate', purpose: 'test moderation', payload: { input: 'hello' } });
    expect(result.result.synthetic_notice).toMatch(/does not perform real safety moderation/i);
  });
});
