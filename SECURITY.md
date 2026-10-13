# Security

Security and privacy are release gates for `together`.

## Reporting vulnerabilities

Do not open a public issue containing exploit details, credentials, private user information, or verification/financial data. Use the repository owner's private security reporting channel when available.

## Repository rules

- Never commit credentials, tokens, private keys or production `.env` files.
- Never use production user data as fixtures or development seeds.
- Never log passwords, access/refresh tokens, authorization headers, private messages, exact GPS, government identifiers, bank details or private AI memory.
- Consumer and admin authentication boundaries remain separate.
- Provider SDKs are isolated behind approved adapters.
- Financial mutations must eventually use immutable ledger transactions and idempotency.
- Sensitive data access must be purpose-scoped and auditable.

## Pull requests

Security-sensitive changes must include tests for authorization, failure handling and redaction. Changes to finance, verification, admin, location or privacy domains require specialist review once those domains are introduced.

## Incident handling

Stage 0 establishes the observability, environment isolation and deployment evidence needed for later incident runbooks. Critical security or privacy regressions block qualification and release.
