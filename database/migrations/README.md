# Database migrations

Stage 0 qualifies the migration foundation against PostgreSQL 18.6 in CI.

Migrations are immutable, ordered SQL files. An applied migration must never be edited: `ops.schema_migrations` stores a SHA-256 checksum and `db:validate` fails if repository content no longer matches the applied record.

Naming:

- up: `NNNN_description.sql`
- optional development/test rollback: `NNNN_description.down.sql`

Large data backfills should use controlled worker jobs rather than long blocking migration transactions.

Stage 0 keeps the migration metadata table inside the `ops` schema even when the bootstrap migration is rolled back so the runner can record rollback state safely.
