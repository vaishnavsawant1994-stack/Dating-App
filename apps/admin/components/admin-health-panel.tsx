'use client';

import { Badge, Button, Card } from '@together/design-system';
import { useState } from 'react';

type HealthState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready' }
  | { readonly kind: 'unavailable'; readonly message: string };

export function AdminHealthPanel({ endpoint }: Readonly<{ endpoint: string }>) {
  const [state, setState] = useState<HealthState>({ kind: 'idle' });

  const check = async () => {
    setState({ kind: 'loading' });
    try {
      const response = await fetch(endpoint, {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) {
        setState({ kind: 'unavailable', message: 'Admin API is not ready.' });
        return;
      }
      setState({ kind: 'ready' });
    } catch {
      setState({ kind: 'unavailable', message: 'Admin API could not be reached.' });
    }
  };

  return (
    <Card aria-live="polite">
      <div className="admin-card-heading">
        <div><p className="admin-eyebrow">Internal API boundary</p><h2>Admin service readiness</h2></div>
        {state.kind === 'ready' ? <Badge tone="success">Ready</Badge> : null}
        {state.kind === 'unavailable' ? <Badge tone="warning">Unavailable</Badge> : null}
      </div>
      <p className="admin-muted">This uses the Admin API origin, never the consumer API origin.</p>
      {state.kind === 'unavailable' ? <p role="status">{state.message}</p> : null}
      <Button onClick={() => void check()} disabled={state.kind === 'loading'}>
        {state.kind === 'loading' ? 'Checking…' : 'Check Admin API'}
      </Button>
    </Card>
  );
}
