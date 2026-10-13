import { type SVGProps } from 'react';

export interface TogetherLogoProps extends SVGProps<SVGSVGElement> {
  readonly label?: string;
}

export function TogetherLogo({ label = 'together', ...props }: TogetherLogoProps) {
  return (
    <svg
      viewBox="0 0 48 36"
      role="img"
      aria-label={`${label} logo`}
      width="40"
      height="30"
      {...props}
    >
      <path
        d="M24 33C18 24 5 22 5 12.8 5 6.7 9.2 3 14.5 3 19 3 22.1 6 24 9.8 25.9 6 29 3 33.5 3 38.8 3 43 6.7 43 12.8 43 22 30 24 24 33Z"
        fill="currentColor"
      />
      <path d="M24 9.8C20.8 14 19.2 18.7 24 33" fill="none" stroke="var(--surface)" strokeWidth="2" />
    </svg>
  );
}
