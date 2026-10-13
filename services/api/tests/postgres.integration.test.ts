import { checkDatabaseHealth, createDatabasePool, migrateUp } from '@together/database';
import { type Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApiApp } from '../src/app.js';

let pool: Pool;

beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString === undefined) {
    throw new Error('DATABASE_URL is required for PostgreSQL API integration tests.');
  }
  pool = createDatabasePool({ connectionString, applicationName: 'api-integration-test' });
  await migrateUp(pool);
});

afterAll(async () => {
  await pool.end();
});

describe('@together/api PostgreSQL readiness', () => {
  it('reports ready against a migrated PostgreSQL database', async () => {
    const app = await buildApiApp(
      {
        serviceName: 'api',
        environment: 'test',
        buildId: 'integration-test',
        logLevel: 'silent',
        bodyLimitBytes: 1024,
        logging: false,
      },
      { checkDatabaseHealth: () => checkDatabaseHealth(pool) },
    );

    try {
      const response = await app.inject({ method: 'GET', url: '/health/ready' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ status: 'ok', environment: 'test' });
    } finally {
      await app.close();
    }
  });
});
