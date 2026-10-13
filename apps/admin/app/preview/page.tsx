import { Card } from '@together/design-system';
import { notFound } from 'next/navigation';
import { AdminHealthPanel } from '@/components/admin-health-panel';
import { AdminShell } from '@/components/admin-shell';
import { decideAdminAccess } from '@/lib/access';
import { adminApiBaseUrl } from '@/lib/config';
import { adminEnvironment } from '@/lib/environment';

export const metadata = { title: 'Stage 0 shell preview' };

export default function AdminPreviewPage() {
  const environment = adminEnvironment();
  const access = decideAdminAccess({
    environment,
    previewEnabled: process.env.ADMIN_SHELL_PREVIEW === 'true',
  });

  if (!access.allowed || access.mode !== 'preview') {
    notFound();
  }

  return (
    <AdminShell environment={environment} preview>
      <header className="admin-page-header">
        <div><p className="admin-eyebrow">Stage 0 internal shell</p><h1>Operations overview</h1></div>
        <span className="admin-readonly">Preview only</span>
      </header>
      <section className="admin-metric-grid" aria-label="Preview operational cards">
        <Card><p className="admin-eyebrow">Users</p><strong className="admin-metric">—</strong><p className="admin-muted">No production data in Stage 0.</p></Card>
        <Card><p className="admin-eyebrow">Safety cases</p><strong className="admin-metric">—</strong><p className="admin-muted">Case access will be permissioned and audited.</p></Card>
        <Card><p className="admin-eyebrow">System health</p><strong className="admin-metric">Foundation</strong><p className="admin-muted">Admin and consumer surfaces remain separate.</p></Card>
      </section>
      <section className="admin-content-grid">
        <Card>
          <p className="admin-eyebrow">Access principle</p>
          <h2>No employee curiosity browsing</h2>
          <p className="admin-muted">Sensitive data access requires an explicit capability, purpose, and audit trail. Stage 0 establishes the UI and routing boundary before data exists.</p>
        </Card>
        <AdminHealthPanel endpoint={`${adminApiBaseUrl()}/health/ready`} />
      </section>
    </AdminShell>
  );
}
