import { type Pool } from 'pg';

export interface DatabaseHealth {
  readonly ok: boolean;
  readonly durationMs: number;
}

export async function checkDatabaseHealth(pool: Pool): Promise<DatabaseHealth> {
  const startedAt = performance.now();
  try {
    await pool.query('SELECT 1');
    return { ok: true, durationMs: performance.now() - startedAt };
  } catch {
    return { ok: false, durationMs: performance.now() - startedAt };
  }
}
