import '@together/design-system/styles.css';
import './globals.css';
import type { Metadata } from 'next';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  title: {
    default: 'together — Real people. Brighter connections.',
    template: '%s — together',
  },
  description: 'A privacy-first human connection platform built around real people and healthier outcomes.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
