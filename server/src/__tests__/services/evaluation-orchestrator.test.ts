import test, { suite } from 'node:test';
import assert from 'node:assert';
import { EvaluationOrchestrator, EvaluationRequest } from '../../application/services/evaluation/evaluation-orchestrator.js';
import { DeterministicSimulationEngine } from '../../engines/simulation/simulation.engine.js';
import { DeterministicImpactEngine } from '../../engines/impact/impact.engine.js';
import { DeterministicResponseEngine } from '../../engines/response/response.engine.js';
import { DeterministicConstraintEngine } from '../../engines/constraint/constraint.engine.js';
import { DeterministicScoringEngine } from '../../engines/scoring/scoring.engine.js';
import { DeterministicRankingEngine } from '../../engines/ranking/ranking.engine.js';
import { DeterministicRecommendationEngine } from '../../engines/recommendation/recommendation.engine.js';

suite('EvaluationOrchestrator', () => {
  const orchestrator = new EvaluationOrchestrator(
    new DeterministicSimulationEngine(),
    new DeterministicImpactEngine(),
    new DeterministicResponseEngine(),
    new DeterministicConstraintEngine(),
    new DeterministicScoringEngine(),
    new DeterministicRankingEngine(),
    new DeterministicRecommendationEngine()
  );

  const mockRequest: EvaluationRequest = {
    scenario: {
      id: 'scenario-1',
      name: 'Test Scenario',
      description: 'Test',
      event_id: 'event-1',
      status: 'DRAFT' as any,
      scenario_version: 1,
      start_time: new Date(),
      end_time: new Date(),
      created_by: 'user-1',
      created_at: new Date(),
      updated_at: new Date()
    },
    disruption: {
      id: 'event-1',
      title: 'Test Disruption',
      description: 'Test',
      event_type: 'NATURAL_DISASTER' as any,
      severity: 'HIGH',
      status: 'DETECTED' as any,
      occurred_at: new Date(),
      detected_at: new Date(),
      affected_region: 'US-West',
      created_at: new Date(),
      updated_at: new Date()
    },
    networkSnapshot: {
      id: 'network-1',
      snapshot_version: 1,
      created_at: new Date(),
      created_by: 'user-1',
      description: 'Test',
      snapshot_data: { nodes: 10, edges: 15 }
    },
    assumptions: []
  };

  test('successfully orchestrates end-to-end evaluation pipeline without errors', async () => {
    const result = await orchestrator.evaluate(mockRequest);

    assert.ok(result);
    assert.strictEqual(result.simulation.id, 'sim-scenario-1');
    assert.strictEqual(result.impact.id, 'impact-scenario-1');
    // Because ResponseEngine is deterministic but currently returns 0 responses without AI logic
    assert.deepStrictEqual(result.responses, []);
    assert.deepStrictEqual(result.constraints, []);
    assert.deepStrictEqual(result.scores, []);
    assert.deepStrictEqual(result.ranking, []);
    assert.strictEqual(result.recommendation, null as any); // null when no ranked responses
  });
});
