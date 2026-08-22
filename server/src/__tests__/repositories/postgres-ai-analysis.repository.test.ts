import test from 'node:test';
import assert from 'node:assert';
import { PostgresAIAnalysisRepository } from '../../repositories/postgres/postgres-ai-analysis.repository.js';
import { DatabaseClient, QueryResult } from '../../infrastructure/database/client.js';

test('PostgresAIAnalysisRepository', async (t) => {
  await t.test('create generates UUID and returns entity', async () => {
    const mockDb: DatabaseClient = {
      query: async <T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> => {
        return {
          rows: [{
            id: 'analysis-1',
            event_id: params?.[1],
            model_name: params?.[2],
            created_at: new Date()
          } as unknown as T],
          rowCount: 1
        };
      }
    };
    
    const repo = new PostgresAIAnalysisRepository(mockDb);
    const analysis = await repo.create({
      event_id: '11111111-1111-1111-1111-111111111111',
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
