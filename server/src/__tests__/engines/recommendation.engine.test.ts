import test, { suite } from 'node:test';
import assert from 'node:assert';
import { DeterministicRecommendationEngine } from '../../engines/recommendation/recommendation.engine.js';
import { RecommendationInput } from '../../application/interfaces/engines.js';
import { BusinessRuleError } from '../../domain/errors/index.js';
import { RankedResponse } from '../../domain/entities/ranked-response.js';

suite('DeterministicRecommendationEngine', () => {
  const engine = new DeterministicRecommendationEngine();

  const mockRankedResponses: RankedResponse[] = [
    {
      id: 'ranked-2',
      evaluation_id: 'eval-1',
      response_candidate_id: 'candidate-2',
      rank: 2,
      score: 10,
      ranking_version: '1.0',
      created_at: new Date()
    },
    {
      id: 'ranked-1',
      evaluation_id: 'eval-1',
      response_candidate_id: 'candidate-1',
      rank: 1,
      score: 15,
      ranking_version: '1.0',
      created_at: new Date()
    },
    {
      id: 'ranked-3',
      evaluation_id: 'eval-1',
      response_candidate_id: 'candidate-3',
      rank: 3,
      score: 5,
      ranking_version: '1.0',
      created_at: new Date()
    }
  ];

  const validBaseInput: RecommendationInput = {
    rankedResponses: mockRankedResponses
  };

  test('valid input chooses the highest valid ranked response (lowest numerical rank)', async () => {
    const result = await engine.recommend(validBaseInput);

    // Should pick candidate-1 because its rank is 1
    assert.strictEqual(result.response_candidate_id, 'candidate-1');
    assert.strictEqual(result.rank, 1);
    assert.strictEqual(result.score, 15);
    
    // Deterministic structural fields
    assert.strictEqual(typeof result.rationale, 'string');
    assert.deepStrictEqual(result.tradeoffs, []);
    assert.deepStrictEqual(result.uncertainty, []);
    assert.strictEqual(result.confidence, 1.0);
    assert.strictEqual(result.created_at.getTime(), 0);
  });

  test('deterministic repeated execution produces identical outputs', async () => {
    const result1 = await engine.recommend(validBaseInput);
    const result2 = await engine.recommend(validBaseInput);

    assert.deepStrictEqual(result1, result2);
  });

  test('no mutation of input objects', async () => {
    const inputSnapshot = JSON.stringify(validBaseInput);

    await engine.recommend(validBaseInput);

    assert.strictEqual(JSON.stringify(validBaseInput), inputSnapshot);
  });

  test('empty array throws BusinessRuleError', async () => {
    await assert.rejects(
      async () => {
        await engine.recommend({ rankedResponses: [] });
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_RECOMMENDATION_INPUT'
    );
  });

  test('missing required input throws BusinessRuleError', async () => {
    await assert.rejects(
      async () => {
        await engine.recommend(null as any);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_RECOMMENDATION_INPUT'
    );
  });

  test('malformed/incomplete input (missing rankedResponses) throws BusinessRuleError', async () => {
    const incompleteInput = { ...validBaseInput, rankedResponses: undefined as any };
    await assert.rejects(
      async () => {
        await engine.recommend(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_RECOMMENDATION_INPUT'
    );
  });
});
