import test from 'node:test';
import assert from 'node:assert/strict';
import { DecisionService } from '../../services/decision.service.js';
import { Recommendation } from '../../entities/index.js';
import { DecisionType } from 'shared';
import { BusinessRuleError } from '../../errors/index.js';

test('DecisionService', async (t) => {
  const recommendation: Recommendation = {
    id: 'rec-1',
    evaluation_id: 'ev-1',
    response_candidate_id: 'rc-1',
    rank: 1,
    score: 0.95,
    rationale: 'Reasoning',
    tradeoffs: [],
    uncertainty: [],
    confidence: 0.9,
    created_at: new Date(),
  };

  await t.test('creates decision when none exists', () => {
    const decision = DecisionService.createDecision(recommendation, false, DecisionType.ACCEPT, 'user-1', 'Reasoning');
    assert.equal(decision.recommendation_id, recommendation.id);
    assert.equal(decision.decision_type, DecisionType.ACCEPT);
    assert.equal(decision.decided_by, 'user-1');
  });

  await t.test('rejects when decision already exists', () => {
    assert.throws(() => DecisionService.createDecision(recommendation, true, DecisionType.ACCEPT, 'user-1', 'Reasoning'), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'DECISION_ALREADY_RECORDED');
      return true;
    });
  });
});
