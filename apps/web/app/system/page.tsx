import { Card } from '@together/design-system';
import { apiBaseUrl } from '@/lib/api/config';

export const metadata = { title: 'System' };

export default function SystemPage() {
  return (
    <section className="narrow-stack">
      <div>
        <p className="eyebrow">Stage 0</p>
        <h1>System shell</h1>
        <p className="lead">Public, non-sensitive runtime information for web qualification.</p>
      </div>
      <Card>
        <dl className="system-list">
          <div><dt>Web framework</dt><dd>Next.js App Router</dd></div>
          <div><dt>Theme foundation</dt><dd>Light / dark</dd></div>
          <div><dt>API base URL</dt><dd>{apiBaseUrl()}</dd></div>
          <div><dt>Product stage</dt><dd>Stage 0 — In Development</dd></div>
        </dl>
      </Card>
    </section>
  );
}
