import { pool } from './pool.js';
import { DatabaseClient, QueryResult } from './client.js';

export const db: DatabaseClient = {
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>> {
    const result = await pool.query(sql, params as any[]);
    return {
      rows: result.rows as T[],
      rowCount: result.rowCount,
    };
  }
};
