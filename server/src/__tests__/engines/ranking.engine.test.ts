import test, { suite } from 'node:test';
import assert from 'node:assert';
import { DeterministicRankingEngine } from '../../engines/ranking/ranking.engine.js';
import { RankingInput } from '../../application/interfaces/engines.js';
import { BusinessRuleError } from '../../domain/errors/index.js';
import { ResponseScore } from '../../domain/entities/response-score.js';

suite('DeterministicRankingEngine', () => {
  const engine = new DeterministicRankingEngine();

  const mockScores: ResponseScore[] = [
    {
      id: 'score-B',
      response_candidate_id: 'candidate-2',
      overall_score: 0,
      dimension_scores: {},
      weights: {},
      scoring_version: '1.0',
      calculated_at: new Date()
    },
    {
      id: 'score-A',
      response_candidate_id: 'candidate-1',
      overall_score: 0,
      dimension_scores: {},
      weights: {},
      scoring_version: '1.0',
      calculated_at: new Date()
    }
  ];

  const validBaseInput: RankingInput = {
    scores: mockScores
  };

  test('valid input produces deterministic structural output (sorted by id for tie-breaking)', async () => {
    const result = await engine.rank(validBaseInput);

    assert.strictEqual(result.length, 2);
    // score-A should come first due to deterministic tie-break sorting by ID
    assert.strictEqual(result[0].response_candidate_id, 'candidate-1');
    assert.strictEqual(result[0].rank, 1);
    
    assert.strictEqual(result[1].response_candidate_id, 'candidate-2');
    assert.strictEqual(result[1].rank, 2);

    assert.strictEqual(result[0].ranking_version, '1.0.0-deterministic');
    assert.strictEqual(result[0].created_at.getTime(), 0);
  });

  test('deterministic repeated execution produces identical outputs', async () => {
    const result1 = await engine.rank(validBaseInput);
    const result2 = await engine.rank(validBaseInput);

    assert.deepStrictEqual(result1, result2);
  });

  test('no mutation of input objects', async () => {
    const inputSnapshot = JSON.stringify(validBaseInput);

    await engine.rank(validBaseInput);

    assert.strictEqual(JSON.stringify(validBaseInput), inputSnapshot);
  });

  test('missing required input throws BusinessRuleError', async () => {
    await assert.rejects(
      async () => {
        await engine.rank(null as any);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_RANKING_INPUT'
    );
  });

  test('malformed/incomplete input (missing scores)', async () => {
    const incompleteInput = { ...validBaseInput, scores: undefined as any };
    await assert.rejects(
      async () => {
        await engine.rank(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_RANKING_INPUT'
    );
  });
});
