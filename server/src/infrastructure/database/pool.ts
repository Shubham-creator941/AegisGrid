import { Pool, PoolConfig } from 'pg';
import { config } from '../../config/index.js';

const poolConfig: PoolConfig = {
  connectionString: config.databaseUrl,
  // Reasonable default pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

// Handle unexpected errors on idle clients
pool.on('error', (err, _client) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

export const getClient = () => pool.connect();

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const closePool = () => pool.end();
