import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Pool } from 'pg';
import { withTransaction } from './transaction.js';

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
export const defaultMigrationDirectory = resolve(sourceDirectory, '../../../database/migrations');
const upMigrationPattern = /^(\d{4})_[a-z0-9_]+\.sql$/;

export interface MigrationFile {
  readonly version: number;
  readonly filename: string;
  readonly path: string;
  readonly downPath: string;
  readonly sql: string;
  readonly checksum: string;
}

export interface AppliedMigration {
  readonly filename: string;
  readonly checksum: string;
  readonly applied_at: Date;
}

export function calculateMigrationChecksum(sql: string): string {
  return createHash('sha256').update(sql, 'utf8').digest('hex');
}

export async function loadMigrations(directory = defaultMigrationDirectory): Promise<MigrationFile[]> {
  const filenames = (await readdir(directory)).filter((name) => upMigrationPattern.test(name)).sort();
  const migrations = await Promise.all(
    filenames.map(async (filename) => {
      const match = upMigrationPattern.exec(filename);
      if (match === null) {
        throw new Error(`Invalid migration filename: ${filename}`);
      }
      const path = resolve(directory, filename);
      const sql = await readFile(path, 'utf8');
      return {
        version: Number.parseInt(match[1] ?? '', 10),
        filename,
        path,
        downPath: resolve(directory, filename.replace(/\.sql$/, '.down.sql')),
        sql,
        checksum: calculateMigrationChecksum(sql),
      };
    }),
  );

  const versions = new Set<number>();
  for (const migration of migrations) {
    if (versions.has(migration.version)) {
      throw new Error(`Duplicate migration version: ${migration.version}`);
    }
    versions.add(migration.version);
  }

  return migrations;
}

export async function ensureMigrationTable(pool: Pool): Promise<void> {
  await pool.query('CREATE SCHEMA IF NOT EXISTS ops');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ops.schema_migrations (
      filename text PRIMARY KEY,
      checksum text NOT NULL,
      execution_ms integer NOT NULL CHECK (execution_ms >= 0),
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function listAppliedMigrations(pool: Pool): Promise<AppliedMigration[]> {
  await ensureMigrationTable(pool);
  const result = await pool.query<AppliedMigration>(
    'SELECT filename, checksum, applied_at FROM ops.schema_migrations ORDER BY filename',
  );
  return result.rows;
}

export async function validateMigrations(pool: Pool, directory = defaultMigrationDirectory): Promise<void> {
  const migrations = await loadMigrations(directory);
  const applied = await listAppliedMigrations(pool);
  const available = new Map(migrations.map((migration) => [migration.filename, migration]));

  for (const record of applied) {
    const migration = available.get(record.filename);
    if (migration === undefined) {
      throw new Error(`Applied migration is missing from repository: ${record.filename}`);
    }
    if (migration.checksum !== record.checksum) {
      throw new Error(`Applied migration checksum changed: ${record.filename}`);
    }
  }
}

export async function migrateUp(pool: Pool, directory = defaultMigrationDirectory): Promise<number> {
  await ensureMigrationTable(pool);
  await validateMigrations(pool, directory);
  const migrations = await loadMigrations(directory);
  const applied = new Set((await listAppliedMigrations(pool)).map((migration) => migration.filename));
  let count = 0;

  for (const migration of migrations) {
    if (applied.has(migration.filename)) {
      continue;
    }

    const startedAt = performance.now();
    await withTransaction(pool, async (client) => {
      await client.query(migration.sql);
      const executionMs = Math.max(0, Math.round(performance.now() - startedAt));
      await client.query(
        'INSERT INTO ops.schema_migrations(filename, checksum, execution_ms) VALUES ($1, $2, $3)',
        [migration.filename, migration.checksum, executionMs],
      );
    });
    count += 1;
  }

  return count;
}

export async function migrateDown(pool: Pool, directory = defaultMigrationDirectory): Promise<string | null> {
  await validateMigrations(pool, directory);
  const applied = await listAppliedMigrations(pool);
  const latest = applied.at(-1);
  if (latest === undefined) {
    return null;
  }

  const migration = (await loadMigrations(directory)).find((candidate) => candidate.filename === latest.filename);
  if (migration === undefined) {
    throw new Error(`Migration not found: ${latest.filename}`);
  }

  let downSql: string;
  try {
    downSql = await readFile(migration.downPath, 'utf8');
  } catch {
    throw new Error(`Rollback SQL is missing for migration: ${migration.filename}`);
  }

  await withTransaction(pool, async (client) => {
    await client.query(downSql);
    await client.query('DELETE FROM ops.schema_migrations WHERE filename = $1', [migration.filename]);
  });

  return migration.filename;
}
