import { type AiAccessAuthorizer } from './types.js';

export class DenyAllAiAccessAuthorizer implements AiAccessAuthorizer {
  isReady(): boolean {
    return false;
  }

  async authorize(): Promise<boolean> {
    return false;
  }
}
