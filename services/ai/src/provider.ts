import { type AiRequest } from './contracts.js';
import { type AiProviderResult } from './types.js';

export interface AiProvider {
  readonly name: string;
  readonly synthetic: boolean;
  isReady(): boolean;
  execute(request: AiRequest): Promise<AiProviderResult>;
}

export class DisabledAiProvider implements AiProvider {
  readonly name = 'disabled';
  readonly synthetic = false;

  isReady(): boolean {
    return false;
  }

  async execute(): Promise<AiProviderResult> {
    throw new Error('AI provider is disabled.');
  }
}
