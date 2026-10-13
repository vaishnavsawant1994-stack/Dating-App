import { type MediaAccessAuthorizer } from './types.js';

export class DenyAllMediaAccessAuthorizer implements MediaAccessAuthorizer {
  isReady(): boolean {
    return false;
  }

  async authorize(): Promise<boolean> {
    return false;
  }
}
