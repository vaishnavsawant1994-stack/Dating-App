# Architecture

`together` is a TypeScript monorepo with strict internal boundaries.

## Applications

- `apps/web` — consumer web application.
- `apps/mobile` — iOS/Android application.
- `apps/admin` — separate internal operations application.

## Services

- `services/api` — core product HTTP API.
- `services/realtime` — WebSocket/presence/call signaling boundary.
- `services/ai` — model gateway and AI policy boundary.
- `services/media` — upload, processing, metadata stripping and delivery boundary.
- `services/safety` — reports, moderation, restrictions, evidence and admin API boundary.
- `services/finance` — wallet, ledgers, payments, payouts and reconciliation boundary.

## Shared packages

Shared packages may be consumed by apps, services and workers. Shared packages must never depend on application/service internals.

## Non-negotiable boundaries

1. Consumer applications never access databases directly.
2. Admin authentication/API surfaces are separate from consumer authentication/API surfaces.
3. Finance is the only writer of financial ledger state.
4. Verification artifacts remain outside ordinary product-service access.
5. Privacy authorization is server-side; clients render decisions but do not become authority.
6. Provider SDKs belong behind provider adapters.
7. Services communicate through contracts, APIs and versioned events rather than private source imports.
8. Sandbox/test data is isolated from production data.
9. Exact-SHA qualification evidence determines stage status.

Detailed architecture documents live under `docs/architecture/` as Stage 0 progresses.
