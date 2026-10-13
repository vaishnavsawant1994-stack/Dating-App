import { FakeAiProvider } from './fake-provider.js';
import { DisabledAiProvider, type AiProvider } from './provider.js';
import { type AiConfig } from './types.js';

export function createAiProvider(config: AiConfig): AiProvider {
  if (config.providerName === 'fake') {
    return new FakeAiProvider();
  }
  return new DisabledAiProvider();
}
