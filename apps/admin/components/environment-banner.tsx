import { type AdminEnvironment } from '@/lib/access';

export interface EnvironmentBannerProps {
  readonly environment: AdminEnvironment;
  readonly mode?: 'authenticated' | 'preview';
}

export function EnvironmentBanner({ environment, mode }: EnvironmentBannerProps) {
  return (
    <div className={`environment-banner environment-banner--${environment}`} role="status">
      <strong>{environment.toUpperCase()}</strong>
      {mode === 'preview' ? <span>Stage 0 preview — no staff session</span> : null}
      {environment === 'production' ? <span>Production data boundary</span> : null}
    </div>
  );
}
