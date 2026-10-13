'use client';

import { Button, Card } from '@together/design-system';

export default function ErrorBoundary({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <Card className="error-card" role="alert">
      <p className="eyebrow">Something went wrong</p>
      <h1>We could not load this page.</h1>
      <p className="muted">No private error details are shown here.</p>
      <Button onClick={reset}>Try again</Button>
    </Card>
  );
}
