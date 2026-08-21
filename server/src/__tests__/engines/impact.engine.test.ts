import test, { suite } from 'node:test';
import assert from 'node:assert';
import { DeterministicImpactEngine } from '../../engines/impact/impact.engine.js';
import { ImpactInput } from '../../application/interfaces/engines.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

suite('DeterministicImpactEngine', () => {
  const engine = new DeterministicImpactEngine();

  const mockSimulationResult = {
    id: 'sim-1',
    evaluation_id: 'eval-1',
    created_at: new Date(),
    available_supply: 500,
    affected_capacity: 500,
    shortfall: 500,
    reserve_level: 0,
    network_state: { nodes: 10, edges: 15 },
    calculation_version: '1.0.0-deterministic'
  };

  const mockScenarioContext = {
    scenario: {
      id: 'scenario-1',
      name: 'Test Scenario',
      description: 'Test Description',
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
      description: 'Test Disruption Description',
      event_type: 'NATURAL_DISASTER' as any,
      severity: 'HIGH',
      status: 'DETECTED' as any,
      occurred_at: new Date(),
      detected_at: new Date(),
      affected_region: 'US-West',
      created_at: new Date(),
      updated_at: new Date()
    }
  };

  const validBaseInput: ImpactInput = {
    simulationResult: mockSimulationResult,
    scenarioContext: mockScenarioContext
  };

  test('valid input produces deterministic structural output', async () => {
    const result = await engine.calculate(validBaseInput);

    assert.strictEqual(result.calculation_version, '1.0.0-deterministic');
    assert.strictEqual(result.id, 'impact-scenario-1');
    assert.strictEqual(result.evaluation_id, 'eval-scenario-1');
    assert.strictEqual(result.created_at.getTime(), 0);
    
    // The PDF does not define mathematical formulas for Impact, so it deterministicly returns 0 
    // to avoid inventing authoritative behavior.
    assert.strictEqual(result.supply_impact, 0);
    assert.strictEqual(result.economic_impact, 0);
    assert.strictEqual(result.operational_impact, 0);
    assert.strictEqual(result.reserve_impact, 0);
    assert.strictEqual(result.resilience_impact, 0);
    assert.strictEqual(result.overall_impact, 0);

    // Architectural Boundary: No scoring, ranking, or recommendations
    assert.strictEqual((result as any).score, undefined);
    assert.strictEqual((result as any).rank, undefined);
    assert.strictEqual((result as any).recommended_response_id, undefined);
  });

  test('deterministic repeated execution produces identical outputs', async () => {
    const result1 = await engine.calculate(validBaseInput);
    const result2 = await engine.calculate(validBaseInput);

    assert.deepStrictEqual(result1, result2);
  });

  test('no mutation of input objects', async () => {
    // We create a copy to compare later.
    // Deep copy using JSON (safe since our mocked inner objects don't rely on Date methods in this check 
    // or we can just JSON stringify equality). 
    // Actually, assert.deepStrictEqual handles structural equality perfectly.
    const inputSnapshot = JSON.stringify(validBaseInput);

    await engine.calculate(validBaseInput);

    assert.strictEqual(JSON.stringify(validBaseInput), inputSnapshot);
  });

  test('missing required input throws BusinessRuleError', async () => {
    await assert.rejects(
      async () => {
        await engine.calculate(null as any);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_IMPACT_INPUT'
    );
  });

  test('malformed/incomplete input (missing simulationResult)', async () => {
    const incompleteInput = { ...validBaseInput, simulationResult: undefined as any };
    await assert.rejects(
      async () => {
        await engine.calculate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_IMPACT_INPUT'
    );
  });

  test('malformed/incomplete input (missing scenarioContext)', async () => {
    const incompleteInput = { ...validBaseInput, scenarioContext: undefined as any };
    await assert.rejects(
      async () => {
        await engine.calculate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_IMPACT_INPUT'
    );
  });

  test('malformed/incomplete input (missing scenario within context)', async () => {
    const incompleteInput = {
      ...validBaseInput,
      scenarioContext: {
        ...mockScenarioContext,
        scenario: undefined as any
      }
    };
    await assert.rejects(
      async () => {
        await engine.calculate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_IMPACT_INPUT'
    );
  });
});
