import { ThemeToggle, TogetherLogo } from '@together/design-system';
import Link from 'next/link';
import { type ReactNode } from 'react';

export interface AppShellProps {
  readonly children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="together home">
          <TogetherLogo aria-hidden="true" />
          <span>together</span>
        </Link>
        <nav className="primary-nav" aria-label="Primary">
          <Link href="/">Home</Link>
          <Link href="/health-demo">Health demo</Link>
          <Link href="/system">System</Link>
        </nav>
        <ThemeToggle />
      </header>
      <main id="main-content" className="page-frame">{children}</main>
      <footer className="footer">Real people. Brighter connections.</footer>
    </div>
  );
}
