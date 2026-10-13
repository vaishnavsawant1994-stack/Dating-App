import '@together/design-system/styles.css';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'together Admin', template: '%s — together Admin' },
  robots: { index: false, follow: false, noarchive: true },
};

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
