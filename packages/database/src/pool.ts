import { Pool } from 'pg';
import { type DatabaseConfig } from './config.js';

export function createDatabasePool(config: DatabaseConfig): Pool {
  return new Pool({
    connectionString: config.connectionString,
    application_name: config.applicationName,
    max: config.maxConnections ?? 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    ssl: config.requireTls === true ? { rejectUnauthorized: true } : undefined,
  });
}
