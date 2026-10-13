import { HealthPanel } from '@/components/health-panel';
import { apiBaseUrl } from '@/lib/api/config';

export const metadata = { title: 'Health demo' };

export default function HealthDemoPage() {
  return (
    <section className="narrow-stack">
      <div>
        <p className="eyebrow">Consumer web → core API</p>
        <h1>Health demo</h1>
        <p className="lead">A minimal Stage 0 connectivity surface using the canonical API readiness contract.</p>
      </div>
      <HealthPanel endpoint={`${apiBaseUrl()}/health/ready`} />
    </section>
  );
}
