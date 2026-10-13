import { type FinanceAccessAuthorizer, type FinancePrincipal } from './types.js';

export class DenyAllFinanceAccessAuthorizer implements FinanceAccessAuthorizer {
  isReady(): boolean {
    return false;
  }

  async authorize(): Promise<FinancePrincipal | null> {
    return null;
  }
}
