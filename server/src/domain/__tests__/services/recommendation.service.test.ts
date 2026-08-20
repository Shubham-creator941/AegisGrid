import test from 'node:test';
import assert from 'node:assert/strict';
import { RecommendationService } from '../../services/recommendation.service.js';
import { ResponseCandidate } from '../../entities/index.js';
import { BusinessRuleError } from '../../errors/index.js';

test('RecommendationService', async (t) => {
  const candidate: ResponseCandidate = {
    id: 'rc-1',
    evaluation_id: 'ev-1',
    response_type: 'STRATEGY',
    name: 'Test Candidate',
    description: 'Test',
    parameters: {},
    status: 'FEASIBLE',
    created_at: new Date(),
  };

  await t.test('creates recommendation for feasible candidate', () => {
    const recommendation = RecommendationService.createRecommendation(candidate, true, 1, 0.95, 'rationale', 0.9);
    assert.equal(recommendation.response_candidate_id, candidate.id);
    assert.equal(recommendation.rank, 1);
  });

  await t.test('rejects infeasible candidate', () => {
    assert.throws(() => RecommendationService.createRecommendation(candidate, false, 1, 0.95, 'rationale', 0.9), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'INFEASIBLE_RESPONSE');
      return true;
    });
  });
});
