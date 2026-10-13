import { Badge, Card, TogetherLogo } from '@together/design-system';

export const metadata = { title: 'Staff sign in' };

export default function AdminLoginPage() {
  return (
    <main className="admin-login-page">
      <Card className="admin-login-card">
        <TogetherLogo className="admin-login-logo" />
        <p className="admin-eyebrow">Internal operations</p>
        <h1>Staff sign in</h1>
        <p className="admin-muted">
          Admin authentication is intentionally fail-closed during Stage 0. Staff identity, MFA,
          device trust, session rotation, and elevated-access controls arrive through the dedicated
          internal authentication boundary.
        </p>
        <div className="admin-login-status">
          <Badge tone="warning">Authentication not enabled</Badge>
          <span>Consumer accounts cannot sign in here.</span>
        </div>
      </Card>
    </main>
  );
}
