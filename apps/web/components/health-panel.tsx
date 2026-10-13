'use client';

import { Badge, Button, Card } from '@together/design-system';
import { useState } from 'react';

export interface HealthPanelProps {
  readonly endpoint: string;
}

type State =
  | { readonly kind: 'idle' }
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly service: string; readonly environment: string }
  | { readonly kind: 'unavailable'; readonly message: string };

export function HealthPanel({ endpoint }: HealthPanelProps) {
  const [state, setState] = useState<State>({ kind: 'idle' });

  const check = async () => {
    setState({ kind: 'loading' });
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) {
        setState({ kind: 'unavailable', message: 'The API is not ready yet.' });
        return;
      }
      const body = (await response.json()) as { service?: unknown; environment?: unknown };
      if (typeof body.service !== 'string' || typeof body.environment !== 'string') {
        setState({ kind: 'unavailable', message: 'The API returned an unexpected response.' });
        return;
      }
      setState({ kind: 'ready', service: body.service, environment: body.environment });
    } catch {
      setState({ kind: 'unavailable', message: 'The API could not be reached.' });
    }
  };

  return (
    <Card aria-live="polite">
      <div className="status-row">
        <div>
          <p className="eyebrow">Stage 0 connectivity</p>
          <h2>Core API readiness</h2>
        </div>
        {state.kind === 'ready' ? <Badge tone="success">Ready</Badge> : null}
        {state.kind === 'unavailable' ? <Badge tone="warning">Unavailable</Badge> : null}
      </div>
      <p className="muted">This checks the public readiness contract without exposing backend secrets.</p>
      {state.kind === 'ready' ? (
        <p><strong>{state.service}</strong> is ready in <strong>{state.environment}</strong>.</p>
      ) : null}
      {state.kind === 'unavailable' ? <p role="status">{state.message}</p> : null}
      <Button onClick={() => void check()} disabled={state.kind === 'loading'}>
        {state.kind === 'loading' ? 'Checking…' : 'Check API'}
      </Button>
    </Card>
  );
}
