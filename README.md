# together

Engineering monorepo for the **together** dating, social, communities, live, creator economy, trust & safety platform.

## Engineering status

The planning chain is frozen through **Stage 0 Implementation Specification v1.0**. Engineering is proceeding stage-by-stage. `main` is the qualified integration branch; feature work lands through reviewed pull requests and later stage qualification evidence.

## Stage 0 goals

Stage 0 establishes the monorepo, shared contracts, service boundaries, database migrations, event infrastructure, local/staging/sandbox environments, CI/CD, security/privacy gates, observability, and exact-SHA qualification before product features begin.

## Workspace

The repository is organized around `apps/`, `services/`, `workers/`, `packages/`, `database/`, `infra/`, `sandbox/`, `tests/`, and `docs/`.

## Local bootstrap

1. Install the Node version from `.nvmrc`.
2. Enable Corepack and install the pinned pnpm version.
3. Run `pnpm install --frozen-lockfile` after the lockfile is introduced.
4. Run `pnpm check` before opening a pull request.

Local infrastructure and application commands will be added in the subsequent Stage 0 pull requests as those components become executable.

## Safety and privacy

This product treats privacy, identity isolation, blocks, verification, safety operations, and financial integrity as architectural foundations rather than later enhancements. See `SECURITY.md` and `ARCHITECTURE.md` for repository-level rules.
