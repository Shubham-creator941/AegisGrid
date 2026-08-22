import test from 'node:test';
import assert from 'node:assert/strict';
import { MakeDecisionApplicationService } from '../../application/services/decision/make-decision.service.js';
import { TransactionManager } from '../../application/interfaces/transaction-manager.interface.js';

test('MakeDecisionApplicationService', async (t) => {
  await t.test('executes transaction and creates decision', async () => {
    const mockTxManager: TransactionManager = {
      execute: async (op) => op()
    };

    const mockDecisionRepo = {
      findById: async () => null,
      findByRecommendationId: async () => null,
      create: async (data: any) => ({ ...data, id: 'd-123' })
    } as any;

    const mockRecommendationRepo = {
      findById: async (id: string) => ({
        id,
        evaluation_id: 'e-1',
        response_candidate_id: 'rc-1',
        rank: 1,
        score: 0.9,
        rationale: 'Best option',
        tradeoffs: [],
        uncertainty: [],
        confidence: 0.95,
        created_at: new Date()
      })
    } as any;

    const mockEvaluationRepo = {
      findById: async () => ({ id: 'e-1', scenario_id: 's-1' })
    } as any;

    const mockScenarioRepo = {
      findById: async () => ({ id: 's-1', status: 'RECOMMENDED' }),
      update: async () => ({})
    } as any;

    const mockAuditLogRepo = {
      create: async () => ({})
    } as any;

    const service = new MakeDecisionApplicationService(
      mockDecisionRepo,
      mockRecommendationRepo,
      mockEvaluationRepo,
      mockScenarioRepo,
      mockAuditLogRepo,
      mockTxManager
    );

    const result = await service.execute({
      recommendation_id: 'r-123',
      decision_type: 'ACCEPT',
      reason: 'Looks good',
      decided_by: 'user-1'
    });

    assert.equal(result.id, 'd-123');
    assert.equal(result.decision_type, 'ACCEPT');
    assert.equal(result.recommendation_id, 'r-123');
  });

  await t.test('fails if recommendation not found', async () => {
    const mockTxManager: TransactionManager = {
      execute: async (op) => op()
    };

    const mockDecisionRepo = {} as any;
    const mockRecommendationRepo = {
      findById: async () => null
    } as any;

    const mockEvaluationRepo = {} as any;
    const mockScenarioRepo = {} as any;
    const mockAuditLogRepo = {} as any;

    const service = new MakeDecisionApplicationService(
      mockDecisionRepo,
      mockRecommendationRepo,
      mockEvaluationRepo,
      mockScenarioRepo,
      mockAuditLogRepo,
      mockTxManager
    );

    await assert.rejects(
      service.execute({
        recommendation_id: 'missing',
        decision_type: 'ACCEPT',
        reason: 'Looks good',
        decided_by: 'user-1'
      }),
      /Recommendation not found/
    );
  });
});
