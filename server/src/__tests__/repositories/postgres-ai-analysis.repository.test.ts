import test, { suite, after } from 'node:test';
import assert from 'node:assert';
import { PostgresAIAnalysisRepository } from '../../repositories/postgres/postgres-ai-analysis.repository.js';
import { getTestDatabase } from '../../infrastructure/database/client.js';

suite('PostgresAIAnalysisRepository', { skip: process.env.NODE_ENV !== 'test' && !process.env.TEST_DATABASE_URL }, () => {
  let db: any;
  let repo: PostgresAIAnalysisRepository;

  test('setup', async () => {
    try {
      db = await getTestDatabase();
      repo = new PostgresAIAnalysisRepository(db);
    } catch (err: any) {
      if (err.message.includes('Database connection failed')) {
        console.log('Database connection failed or unsafe environment: Refusing to run tests against potential production database. Must set TEST_DATABASE_URL or NODE_ENV=test.');
      } else {
        throw err;
      }
    }
  });

  after(async () => {
    if (db) {
      await db.close();
    }
  });

  test('create generates UUID and returns entity', async (t) => {
    if (!db) {
      t.skip('Database unavailable');
      return;
    }
    const analysis = await repo.create({
      event_id: '11111111-1111-1111-1111-111111111111', // Assuming there's a dummy event or FK is not strictly checked for test
      model_name: 'test-model',
      model_version: 'v1',
      analysis_version: 1,
      structured_output: { test: true },
      confidence: 0.99
    });
    
    assert.ok(analysis.id);
    assert.strictEqual(analysis.model_name, 'test-model');
    assert.ok(analysis.created_at);
  });
});
