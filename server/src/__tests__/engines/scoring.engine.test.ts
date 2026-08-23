import test, { suite } from 'node:test';
import assert from 'node:assert';
import { DeterministicScoringEngine } from '../../engines/scoring/scoring.engine.js';
import { ScoringInput } from '../../application/interfaces/engines.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

suite('DeterministicScoringEngine', () => {
  const engine = new DeterministicScoringEngine();

  const mockResponseCandidate = {
    id: 'candidate-1',
    evaluation_id: 'eval-1',
    response_type: 'REROUTE',
    name: 'Test Reroute',
    description: 'Test',
    parameters: {},
    status: 'GENERATED',
    created_at: new Date()
  };

  const mockConstraintEvaluation = {
    id: 'eval-1',
    evaluation_id: 'eval-1',
    response_candidate_id: 'candidate-1',
    feasible: true,
    violations: {},
    constraint_version: '1.0',
    evaluated_at: new Date()
  };

  const mockImpactAssessment = {
    id: 'impact-1',
    evaluation_id: 'eval-1',
    supply_impact: 0,
    economic_impact: 0,
    operational_impact: 0,
    reserve_impact: 0,
    resilience_impact: 0,
    overall_impact: 0,
    calculation_version: '1.0',
    created_at: new Date()
  };

  const mockScenarioContext = {
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
      affected_region: 'US', 
      created_at: new Date(),
      updated_at: new Date()
    }
  };

  const validBaseInput: ScoringInput = {
    responseCandidate: mockResponseCandidate,
    constraintEvaluation: mockConstraintEvaluation,
    impactAssessment: mockImpactAssessment,
    scenarioContext: mockScenarioContext
  };

  test('valid input produces deterministic structural output (0.1 score)', async () => {
    const result = await engine.score(validBaseInput);

    assert.strictEqual(result.calculation_version, undefined);
    assert.strictEqual(result.scoring_version, '1.0.0-deterministic');
    assert.strictEqual(result.id, 'candidate-1-score');
    assert.strictEqual(result.response_candidate_id, 'candidate-1');
    assert.strictEqual(result.created_at, undefined);
    assert.strictEqual(result.calculated_at.getTime(), 0);
    assert.strictEqual(result.overall_score, 0.1);
  });

  test('deterministic repeated execution produces identical outputs', async () => {
    const result1 = await engine.score(validBaseInput);
    const result2 = await engine.score(validBaseInput);

    assert.deepStrictEqual(result1, result2);
  });

  test('no mutation of input objects', async () => {
    const inputSnapshot = JSON.stringify(validBaseInput);

    await engine.score(validBaseInput);

    assert.strictEqual(JSON.stringify(validBaseInput), inputSnapshot);
  });

  test('missing required input throws BusinessRuleError', async () => {
    await assert.rejects(
      async () => {
        await engine.score(null as any);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_SCORING_INPUT'
    );
  });

  test('malformed/incomplete input (missing responseCandidate)', async () => {
    const incompleteInput = { ...validBaseInput, responseCandidate: undefined as any };
    await assert.rejects(
      async () => {
        await engine.score(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_SCORING_INPUT'
    );
  });

  test('malformed/incomplete input (missing constraintEvaluation)', async () => {
    const incompleteInput = { ...validBaseInput, constraintEvaluation: undefined as any };
    await assert.rejects(
      async () => {
        await engine.score(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_SCORING_INPUT'
    );
  });
});
