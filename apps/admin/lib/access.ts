export type AdminEnvironment = 'local' | 'test' | 'preview' | 'staging' | 'sandbox' | 'production';

export interface AdminAccessInput {
  readonly environment: AdminEnvironment;
  readonly sessionAudience?: string;
  readonly previewEnabled: boolean;
}

export type AdminAccessDecision =
  | { readonly allowed: true; readonly mode: 'authenticated' | 'preview' }
  | { readonly allowed: false; readonly reason: 'AUTH_REQUIRED' | 'WRONG_AUDIENCE' | 'PREVIEW_DISABLED' };

export function decideAdminAccess(input: AdminAccessInput): AdminAccessDecision {
  if (input.sessionAudience !== undefined) {
    return input.sessionAudience === 'together-admin'
      ? { allowed: true, mode: 'authenticated' }
      : { allowed: false, reason: 'WRONG_AUDIENCE' };
  }

  if (input.previewEnabled && input.environment !== 'production') {
    return { allowed: true, mode: 'preview' };
  }

  return {
    allowed: false,
    reason: input.previewEnabled ? 'PREVIEW_DISABLED' : 'AUTH_REQUIRED',
  };
}
