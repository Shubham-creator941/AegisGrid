export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number | null;
}

export interface DatabaseClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}
