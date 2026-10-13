import { randomUUID } from 'node:crypto';
import { type Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  createDatabasePool,
  enqueueOutboxEvent,
  loadDatabaseCliConfig,
  markEventProcessed,
  migrateUp,
  validateMigrations,
  withTransaction,
} from '../src/index.js';

let pool: Pool;

beforeAll(async () => {
  pool = createDatabasePool(loadDatabaseCliConfig());
  await migrateUp(pool);
});

afterAll(async () => {
  await pool.end();
});

describe('@together/database PostgreSQL integration', () => {
  it('creates all Stage 0 schema namespaces and validates checksums', async () => {
    await validateMigrations(pool);
    const result = await pool.query<{ schema_name: string }>(
      `SELECT schema_name FROM information_schema.schemata
       WHERE schema_name IN ('auth', 'account', 'verification', 'identity', 'privacy', 'finance', 'safety', 'audit')`,
    );
    expect(new Set(result.rows.map((row) => row.schema_name))).toEqual(
      new Set(['auth', 'account', 'verification', 'identity', 'privacy', 'finance', 'safety', 'audit']),
    );
  });

  it('rolls back application work atomically', async () => {
    await expect(
      withTransaction(pool, async (client) => {
        await client.query('CREATE TABLE ops.transaction_probe(id integer PRIMARY KEY)');
        throw new Error('force rollback');
      }),
    ).rejects.toThrow('force rollback');

    const result = await pool.query<{ table_ref: string | null }>(
      "SELECT to_regclass('ops.transaction_probe')::text AS table_ref",
    );
    expect(result.rows[0]?.table_ref ?? null).toBeNull();
  });

  it('stores an outbox event in the caller transaction', async () => {
    const eventId = randomUUID();
    await withTransaction(pool, async (client) => {
      await enqueueOutboxEvent(client, {
        event_id: eventId,
        event_type: 'PlatformSmokeEvent',
        version: 1,
        occurred_at: new Date().toISOString(),
        producer: 'database-test',
        entity_type: 'platform_probe',
        entity_id: randomUUID(),
        correlation_id: randomUUID(),
        payload: { probe_id: randomUUID(), message: 'stage0-smoke' },
      });
    });

    const result = await pool.query<{ id: string }>('SELECT id FROM ops.outbox_events WHERE id = $1', [
      eventId,
    ]);
    expect(result.rows).toHaveLength(1);
  });

  it('deduplicates processed events per consumer', async () => {
    const eventId = randomUUID();
    await withTransaction(pool, async (client) => {
      expect(await markEventProcessed(client, 'stage0-consumer', eventId)).toBe(true);
      expect(await markEventProcessed(client, 'stage0-consumer', eventId)).toBe(false);
    });
  });
});
