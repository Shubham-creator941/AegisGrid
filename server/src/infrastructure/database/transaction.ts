import { pool } from './pool.js';
import { DatabaseClient, QueryResult } from './client.js';

export async function withTransaction<T>(
  callback: (client: DatabaseClient) => Promise<T>
): Promise<T> {
  const pgClient = await pool.connect();

  const txClient: DatabaseClient = {
    async query<R = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<R>> {
      const result = await pgClient.query(sql, params as any[]);
      return {
        rows: result.rows as R[],
        rowCount: result.rowCount,
      };
    }
  };

  try {
    await pgClient.query('BEGIN');
    const result = await callback(txClient);
    await pgClient.query('COMMIT');
    return result;
  } catch (error) {
    await pgClient.query('ROLLBACK');
    throw error;
  } finally {
    pgClient.release();
  }
}
