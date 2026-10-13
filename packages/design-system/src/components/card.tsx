import { type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly selected?: boolean;
}

export function Card({ className = '', selected = false, ...props }: CardProps) {
  return (
    <div
      className={`tg-card${selected ? ' tg-card--selected' : ''} ${className}`.trim()}
      {...props}
    />
  );
}
