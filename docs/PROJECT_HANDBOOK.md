# Together — Social and Dating Platform — Project Handbook

> **Repository:** [vaishnavsawant1994-stack/Dating-App](https://github.com/vaishnavsawant1994-stack/Dating-App)  
> **Documentation review:** 15 November 2026 · **Scope:** checked-in source and existing documentation, not a fresh end-to-end certification.

## 1. Purpose and intended audience

**Goal:** Staged monorepo for dating, communities, live/social interactions and creator workflows, with trust-and-safety requirements from the outset.

**Who this serves:** Engineers designing a privacy-sensitive social, dating and community product.

## 2. Product features and expected journeys

1. Establish shared contracts and app/service boundaries.
2. Plan web, mobile, API, realtime and moderation services.
3. Define migration, event and CI patterns.
4. Treat user safety and privacy as release gates.

These are described product areas or repository-supported development paths. See the status and limitations below before claiming live feature completeness.

## 3. Technical architecture and project structure

TypeScript pnpm/Turborepo with `apps/`, `services/`, `packages/`, `database/` and security/architecture docs. The package scripts expose web/admin/mobile, API, realtime, AI, safety, finance and media dev targets.

## 4. Implementation maturity and evidence

README identifies Stage 0 implementation specification and a gated integration path. Service folders and scripts do not prove a released dating/social platform.

**Evidence level:** Repository source, current README and available manifest/structure were inspected. No new unit-test run, database migration, browser acceptance, security penetration test, CI re-run or live deployment is implied by this document. Treat older gate reports as date- and commit-specific records.

## 5. Installation, development and validation

Install Node/pnpm versions required by the repo, `pnpm install`, then `pnpm check`; isolated service development via `pnpm dev:web`, `pnpm dev:api`, etc. Configure disposable databases/services before migrations.

Recheck exact commands, package versions and environment variables against the current source. Use disposable credentials and isolated local/test data; never run destructive migrations or seed scripts against an unknown database.

## 6. Security, data and operational boundaries

- Consent, blocking, reporting, moderation and account deletion need evidence.
- Never use real user/age/location data in seed fixtures.
- Do not activate billing, live messaging or discovery flows without guardrails.

For production use additionally verify access control, errors, secrets, backup/recovery, monitoring and relevant legal/privacy responsibilities.

## 7. Recommended next milestones

1. Finish Stage 0 CI/contract proof.
2. Specify privacy/data retention and moderation controls.
3. Verify auth/session/tenant boundaries.
4. Implement limited, testable user journeys stage by stage.

## 8. Source documents and change policy

- [`README.md`](../README.md)
- [`ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`SECURITY.md`](../SECURITY.md)
- [`package.json`](../package.json)
- [`database/`](../database/)

This handbook supplements rather than replaces authoritative specs, security rules and exact-SHA qualification. Update it whenever the application architecture, deployment status, feature contract or project ownership changes.
