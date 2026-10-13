import { type ImgHTMLAttributes } from 'react';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'src'> {
  readonly alt: string;
  readonly fallback: string;
  readonly src?: string;
}

export function Avatar({ alt, fallback, src, className = '', ...props }: AvatarProps) {
  if (src === undefined || src.length === 0) {
    return (
      <span className={`tg-avatar tg-avatar--fallback ${className}`.trim()} aria-label={alt} role="img">
        {fallback.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return <img className={`tg-avatar ${className}`.trim()} src={src} alt={alt} {...props} />;
}
