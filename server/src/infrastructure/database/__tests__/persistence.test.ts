import test, { suite } from 'node:test';
import assert from 'node:assert';
import { pool } from '../pool.js';
import { db } from '../query.js';
import { withTransaction } from '../transaction.js';
import { execSync } from 'child_process';
import path from 'path';

suite('Persistence Infrastructure', async () => {
  // Test connection first
  let dbAvailable = false;
  
  test('A. Connection Verification', async (t) => {
    try {
      // 1. SAFETY: Never silently use production DATABASE_URL for tests
      if (!process.env.TEST_DATABASE_URL && process.env.NODE_ENV !== 'test') {
        throw new Error('Refusing to run tests against potential production database. Must set TEST_DATABASE_URL or NODE_ENV=test.');
      }

      const client = await pool.connect();
      client.release();
      dbAvailable = true;
      assert.ok(true, 'Connection successful');
    } catch (err: any) {
      dbAvailable = false;
      console.warn('REAL POSTGRESQL TESTS: NOT EXECUTED');
      console.warn('Database connection failed or unsafe environment:', err.message);
      // The instructions say: "Must skip PostgreSQL-dependent tests if the environment is not prepared, clearly marking them."
      t.skip('Database connection failed or unsafe environment: ' + err.message);
      return;
    }
  });

  test('B. Query Execution', async (t) => {
    if (!dbAvailable) return t.skip('No DB');
    const result = await db.query<{ num: number }>('SELECT 1 as num');
    assert.strictEqual(result.rows.length, 1);
    assert.strictEqual(result.rows[0].num, 1);
  });

  test('C. Transaction Commit', async (t) => {
    if (!dbAvailable) return t.skip('No DB');
    await withTransaction(async (txClient) => {
      const res = await txClient.query<{ val: number }>('SELECT 2 as val');
      assert.strictEqual(res.rows[0].val, 2);
    });
    assert.ok(true, 'Transaction committed without throwing');
  });

  test('D. Transaction Rollback', async (t) => {
    if (!dbAvailable) return t.skip('No DB');
    try {
      await withTransaction(async (txClient) => {
        await txClient.query<{ val: number }>('SELECT 3 as val');
        throw new Error('Trigger rollback');
      });
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.strictEqual(err.message, 'Trigger rollback');
    }
  });

  test('E. Transaction Connection Isolation', async (t) => {
    if (!dbAvailable) return t.skip('No DB');
    // We can verify isolation by checking the backend PID of the connection
    await withTransaction(async (txClient) => {
      const res1 = await txClient.query<{ pid: number }>('SELECT pg_backend_pid() as pid');
      const res2 = await txClient.query<{ pid: number }>('SELECT pg_backend_pid() as pid');
      assert.strictEqual(res1.rows[0].pid, res2.rows[0].pid, 'Must use same client/PID');
    });
  });

  test('G. Migration Verification', async (t) => {
    if (!dbAvailable) return t.skip('No DB');
    // We verify the migration runner script structurally
    // It should exit cleanly if there are no migrations or if it's already up to date.
    const runnerPath = path.resolve(__dirname, '../../database/migration-runner.ts');
    try {
      const output = execSync(`npx tsx ${runnerPath}`, { encoding: 'utf-8', env: process.env });
      assert.ok(output.includes('Database is up to date') || output.includes('Successfully applied') || output.includes('Migrations complete'), 'Migration runner completed');
    } catch (err: any) {
      assert.fail(`Migration runner failed: ${err.message}`);
    }
  });

  test('F. Disconnect / Pool Shutdown', async (t) => {
    // This is the last test, it shuts down the pool
    await pool.end();
    assert.strictEqual(pool.totalCount, 0, 'Pool should have 0 total clients after end');
  });
});
