import { type HTMLAttributes } from 'react';

export type ChipKind = 'identity' | 'privacy' | 'verification' | 'visibility';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  readonly kind?: ChipKind;
}

export function Chip({ className = '', kind = 'identity', ...props }: ChipProps) {
  return <span className={`tg-chip tg-chip--${kind} ${className}`.trim()} {...props} />;
}

export const IdentityChip = (props: Omit<ChipProps, 'kind'>) => <Chip kind="identity" {...props} />;
export const PrivacyChip = (props: Omit<ChipProps, 'kind'>) => <Chip kind="privacy" {...props} />;
export const VerificationBadge = (props: Omit<ChipProps, 'kind'>) => (
  <Chip kind="verification" {...props} />
);
export const VisibilityChip = (props: Omit<ChipProps, 'kind'>) => <Chip kind="visibility" {...props} />;
