import { Card } from '@together/design-system';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="admin-login-page">
      <Card className="admin-login-card">
        <p className="admin-eyebrow">Unavailable</p>
        <h1>Admin surface not available.</h1>
        <p className="admin-muted">This route is disabled in the current environment or requires staff authentication.</p>
        <Link href="/login">Return to staff sign in</Link>
      </Card>
    </main>
  );
}
