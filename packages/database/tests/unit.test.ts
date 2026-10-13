import { describe, expect, it } from 'vitest';
import { calculateMigrationChecksum, loadMigrations } from '../src/index.js';

describe('@together/database migration metadata', () => {
  it('creates deterministic SHA-256 migration checksums', () => {
    expect(calculateMigrationChecksum('SELECT 1;')).toBe(calculateMigrationChecksum('SELECT 1;'));
    expect(calculateMigrationChecksum('SELECT 1;')).not.toBe(calculateMigrationChecksum('SELECT 2;'));
  });

  it('loads uniquely versioned repository migrations', async () => {
    const migrations = await loadMigrations();
    expect(migrations.length).toBeGreaterThan(0);
    expect(new Set(migrations.map((migration) => migration.version)).size).toBe(migrations.length);
  });
});
