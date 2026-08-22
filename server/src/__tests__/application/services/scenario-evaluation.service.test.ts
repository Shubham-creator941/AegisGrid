import test, { suite } from 'node:test';
import assert from 'node:assert';
import { ScenarioEvaluationService } from '../../../application/services/evaluation/scenario-evaluation.service.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';
import { ScenarioState } from 'shared';

suite('ScenarioEvaluationService', () => {
  const mockScenario = {
    id: 'scenario-1',
    event_id: 'event-1',
    status: ScenarioState.DRAFT
  };

  const mockEvent = {
    id: 'event-1',
    status: 'DETECTED'
  };

  const mockAnalysis = { id: 'analysis-1' };
  const mockRiskAssessment = { id: 'risk-1' };
  const mockNetworkSnapshot = { id: 'net-1' };

  const mockOrchestrator = {
    evaluate: async () => ({
      responses: [{ id: 'cand-1', response_type: 'A', name: 'N', description: 'D', parameters: {}, status: 'ACTIVE' }],
      constraints: [{ response_candidate_id: 'cand-1', feasible: true, violations: [], constraint_version: '1.0' }],
      scores: [{ response_candidate_id: 'cand-1', overall_score: 95, dimension_scores: {}, weights: {}, scoring_version: '1.0' }],
      recommendation: { response_candidate_id: 'cand-1', rank: 1, score: 95, rationale: '', tradeoffs: [], uncertainty: [], confidence: 0.9 },
      impact: { supply_impact: 1, economic_impact: 1, operational_impact: 1, reserve_impact: 1, resilience_impact: 1, overall_impact: 1, calculation_version: '1.0' }
    })
  };

  const mockTxManager = {
    execute: async <T>(cb: () => Promise<T>): Promise<T> => cb()
  };

  test('rejects when scenario is not found', async () => {
    const service = new ScenarioEvaluationService(
      {} as any, { findById: async () => null } as any, {} as any, {} as any, 
      {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, 
      {} as any, {} as any, {} as any, mockTxManager as any
    );
    await assert.rejects(
      async () => service.evaluateScenario('scenario-1'),
      (err: any) => err instanceof BusinessRuleError && err.code === 'SCENARIO_NOT_FOUND'
    );
  });

  test('rejects when event is not found', async () => {
    const service = new ScenarioEvaluationService(
      { findById: async () => null } as any, 
      { findById: async () => mockScenario } as any, 
      {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, 
      {} as any, {} as any, {} as any, {} as any, {} as any, mockTxManager as any
    );
    await assert.rejects(
      async () => service.evaluateScenario('scenario-1'),
      (err: any) => err instanceof BusinessRuleError && err.code === 'EVENT_NOT_FOUND'
    );
  });

  test('rejects when analysis is missing', async () => {
    const service = new ScenarioEvaluationService(
      { findById: async () => mockEvent } as any, 
      { findById: async () => mockScenario } as any, 
      {} as any, 
      { findByEventId: async () => null } as any, 
      {} as any, {} as any, {} as any, {} as any, {} as any, {} as any, 
      {} as any, {} as any, {} as any, mockTxManager as any
    );
    await assert.rejects(
      async () => service.evaluateScenario('scenario-1'),
      (err: any) => err instanceof BusinessRuleError && err.code === 'ANALYSIS_NOT_READY'
    );
  });

  test('successfully evaluates and persists output', async () => {
    let scenarioUpdated = false;
    let evalCreated = false;
    let candidateCreated = false;
    let constraintCreated = false;
    let scoreCreated = false;
    let recommendationCreated = false;

    const service = new ScenarioEvaluationService(
      { findById: async () => mockEvent } as any, 
      { 
        findById: async () => mockScenario,
        update: async (id: string, updates: any) => {
          assert.strictEqual(id, 'scenario-1');
          assert.strictEqual(updates.status, ScenarioState.RECOMMENDED);
          scenarioUpdated = true;
        }
      } as any, 
      { listByScenarioId: async () => ({ data: [] }) } as any, 
      { findByEventId: async () => mockAnalysis } as any, 
      { getLatestSnapshot: async () => mockNetworkSnapshot } as any, 
      { findByEventId: async () => mockRiskAssessment } as any, 
      { create: async (e: any) => { evalCreated = true; return { ...e, id: 'eval-1' }; } } as any, 
      { create: async () => {} } as any, // impact repo
      { create: async () => { candidateCreated = true; return { id: 'cand-1' }; } } as any, 
      { create: async () => { constraintCreated = true; } } as any, 
      { create: async () => { scoreCreated = true; } } as any, 
      { create: async () => { recommendationCreated = true; } } as any, 
      mockOrchestrator as any, 
      mockTxManager as any
    );

    const res = await service.evaluateScenario('scenario-1');
    
    assert.ok(res.evaluation);
    assert.strictEqual(scenarioUpdated, true);
    assert.strictEqual(evalCreated, true);
    assert.strictEqual(candidateCreated, true);
    assert.strictEqual(constraintCreated, true);
    assert.strictEqual(scoreCreated, true);
    assert.strictEqual(recommendationCreated, true);
  });
});
