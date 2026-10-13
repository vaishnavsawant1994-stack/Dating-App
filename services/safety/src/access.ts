import { type SafetyAccessAuthorizer, type SafetyPrincipal } from './types.js';

export class DenyAllSafetyAccessAuthorizer implements SafetyAccessAuthorizer {
  isReady(): boolean {
    return false;
  }

  async authorize(): Promise<SafetyPrincipal | null> {
    return null;
  }
}
