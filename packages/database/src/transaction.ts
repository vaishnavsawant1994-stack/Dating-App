import { type Pool, type PoolClient } from 'pg';

export async function withTransaction<TResult>(
  pool: Pool,
  operation: (client: PoolClient) => Promise<TResult>,
): Promise<TResult> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Preserve the original application/database failure.
    }
    throw error;
  } finally {
    client.release();
  }
}
