import test, { suite } from 'node:test';
import assert from 'node:assert';
import { DeterministicConstraintEngine } from '../../engines/constraint/constraint.engine.js';
import { ConstraintInput } from '../../application/interfaces/engines.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

suite('DeterministicConstraintEngine', () => {
  const engine = new DeterministicConstraintEngine();

  const mockResponseCandidate = {
    id: 'candidate-1',
    evaluation_id: 'eval-1',
    response_type: 'REROUTE',
    name: 'Test',
    description: 'Test',
    parameters: {},
    status: 'GENERATED',
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

  const mockNetworkSnapshot = {
    id: 'snap-1',
    snapshot_version: 1,
    created_at: new Date(),
    created_by: 'user-1',
    description: 'Test Network',
    snapshot_data: { nodes: 10, edges: 15 }
  };

  const validBaseInput: ConstraintInput = {
    responseCandidate: { ...mockResponseCandidate, parameters: { volume: 100, altFlowId: 'flow-2' } },
    scenarioContext: {
      scenario: { id: 's1' } as any,
      disruption: { id: 'e1' } as any,
      simulationResult: { id: 'sim1', affected_flow_ids: ['flow-1'] } as any
    } as any,
    networkSnapshot: { id: 'ns1', snapshot_data: { affected_flow_ids: ['flow-1'] } } as any
  };

  test('valid input produces deterministic structural output (feasible: true)', async () => {
    const result = await engine.evaluate(validBaseInput);

    assert.strictEqual(result.response_candidate_id, 'candidate-1');
    assert.strictEqual(result.feasible, true);
    assert.deepStrictEqual(result.violations, []);
    assert.strictEqual(result.constraint_version, '1.0.0-deterministic');
    assert.strictEqual(result.evaluated_at.getTime(), 0);
  });

  test('deterministic repeated execution produces identical outputs', async () => {
    const result1 = await engine.evaluate(validBaseInput);
    const result2 = await engine.evaluate(validBaseInput);

    assert.deepStrictEqual(result1, result2);
  });

  test('no mutation of input objects', async () => {
    const inputSnapshot = JSON.stringify(validBaseInput);

    await engine.evaluate(validBaseInput);

    assert.strictEqual(JSON.stringify(validBaseInput), inputSnapshot);
  });

  test('missing required input throws BusinessRuleError', async () => {
    await assert.rejects(
      async () => {
        await engine.evaluate(null as any);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_CONSTRAINT_INPUT'
    );
  });

  test('malformed/incomplete input (missing responseCandidate)', async () => {
    const incompleteInput = { ...validBaseInput, responseCandidate: undefined as any };
    await assert.rejects(
      async () => {
        await engine.evaluate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_CONSTRAINT_INPUT'
    );
  });
  
  test('malformed/incomplete input (missing scenarioContext)', async () => {
    const incompleteInput = { ...validBaseInput, scenarioContext: undefined as any };
    await assert.rejects(
      async () => {
        await engine.evaluate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_CONSTRAINT_INPUT'
    );
  });

  test('malformed/incomplete input (missing networkSnapshot)', async () => {
    const incompleteInput = { ...validBaseInput, networkSnapshot: undefined as any };
    await assert.rejects(
      async () => {
        await engine.evaluate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_CONSTRAINT_INPUT'
    );
  });
});
