import { type HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly tone?: 'neutral' | 'rose' | 'success' | 'warning';
}

export function Badge({ className = '', tone = 'neutral', ...props }: BadgeProps) {
  return <span className={`tg-badge tg-badge--${tone} ${className}`.trim()} {...props} />;
}
