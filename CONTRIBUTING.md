# Contributing

## Branches

Use focused branches such as `stage0/<work-package>` or `feature/<domain>-<description>`.

`main` is the qualified integration branch. Do not bypass pull-request review for normal engineering work.

## Before opening a pull request

Run:

```bash
pnpm check
```

When relevant, also run contract, database, security, privacy and end-to-end suites introduced by later Stage 0 pull requests.

## Pull-request requirements

Describe:

- what changed;
- affected domain(s);
- API/schema changes;
- privacy impact;
- security impact;
- financial or AI impact;
- migrations;
- feature flags;
- tests;
- rollback implications;
- qualification-stage impact.

## Database changes

Migrations are version-controlled SQL. Never edit an already-applied migration. Large backfills belong in controlled jobs rather than long blocking migration transactions.

## Generated files

Generated contracts, clients or schema artifacts must be reproducible. CI will eventually fail when generated outputs are stale.

## Stage qualification

A stage is not complete because code exists. Qualification is tied to an exact commit/build and requires its defined security, privacy, database, test and deployment gates to pass.
