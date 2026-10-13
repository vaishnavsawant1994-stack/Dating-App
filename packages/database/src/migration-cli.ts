import { createDatabasePool } from './pool.js';
import { loadDatabaseCliConfig } from './config.js';
import {
  listAppliedMigrations,
  migrateDown,
  migrateUp,
  validateMigrations,
} from './migration.js';

async function main(): Promise<void> {
  const command = process.argv[2];
  const pool = createDatabasePool(loadDatabaseCliConfig());

  try {
    if (command === 'up') {
      const count = await migrateUp(pool);
      console.log(`Applied ${count} migration(s).`);
      return;
    }
    if (command === 'down') {
      const migration = await migrateDown(pool);
      console.log(migration === null ? 'No migration to roll back.' : `Rolled back ${migration}.`);
      return;
    }
    if (command === 'status') {
      const applied = await listAppliedMigrations(pool);
      for (const migration of applied) {
        console.log(`${migration.filename} ${migration.checksum}`);
      }
      return;
    }
    if (command === 'validate') {
      await validateMigrations(pool);
      console.log('Migration checksums are valid.');
      return;
    }
    throw new Error('Expected migration command: up | down | status | validate');
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown migration failure';
  console.error(message);
  process.exitCode = 1;
});
