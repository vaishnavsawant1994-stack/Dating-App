import { TogetherLogo } from '@together/design-system';
import Link from 'next/link';
import { type ReactNode } from 'react';
import { EnvironmentBanner } from './environment-banner';
import { type AdminEnvironment } from '@/lib/access';
import { adminCapabilities, navigationForCapabilities } from '@/lib/permissions';

export interface AdminShellProps {
  readonly children: ReactNode;
  readonly environment: AdminEnvironment;
  readonly preview?: boolean;
}

export function AdminShell({ children, environment, preview = false }: AdminShellProps) {
  const navigation = navigationForCapabilities(new Set(adminCapabilities));
  return (
    <div className="admin-shell">
      <a className="admin-skip-link" href="#admin-main">Skip to admin content</a>
      <EnvironmentBanner environment={environment} mode={preview ? 'preview' : 'authenticated'} />
      <aside className="admin-sidebar">
        <Link className="admin-brand" href={preview ? '/preview' : '/overview'} aria-label="together admin home">
          <TogetherLogo aria-hidden="true" />
          <span><strong>together</strong><small>Admin</small></span>
        </Link>
        <nav aria-label="Admin navigation">
          {navigation.map((item) => (
            <Link key={item.href} href={preview ? `/preview#${item.href.slice(1)}` : item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="admin-sidebar-note">Least privilege · audited access</p>
      </aside>
      <main id="admin-main" className="admin-main">{children}</main>
    </div>
  );
}
