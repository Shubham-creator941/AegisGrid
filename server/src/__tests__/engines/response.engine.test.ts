import test, { suite } from 'node:test';
import assert from 'node:assert';
import { DeterministicResponseEngine } from '../../engines/response/response.engine.js';
import { ResponseInput } from '../../application/interfaces/engines.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

suite('DeterministicResponseEngine', () => {
  const engine = new DeterministicResponseEngine();

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

  const mockImpactAssessment = {
    id: 'impact-1',
    evaluation_id: 'eval-1',
    supply_impact: 0,
    economic_impact: 0,
    operational_impact: 0,
    reserve_impact: 0,
    resilience_impact: 0,
    overall_impact: 0,
    calculation_version: '1.0.0-deterministic',
    created_at: new Date()
  };

  const validBaseInput: ResponseInput = {
    scenarioContext: mockScenarioContext,
    simulationResult: mockSimulationResult,
    impactAssessment: mockImpactAssessment
  };

  test('valid input produces deterministic structural output (empty array)', async () => {
    const result = await engine.generate(validBaseInput);

    // The PDF does not define mathematical formulas or rules for candidate generation.
    // It deterministically returns an empty array to avoid inventing authoritative behavior.
    assert.ok(Array.isArray(result));
    assert.strictEqual(result.length, 0);
  });

  test('deterministic repeated execution produces identical outputs', async () => {
    const result1 = await engine.generate(validBaseInput);
    const result2 = await engine.generate(validBaseInput);

    assert.deepStrictEqual(result1, result2);
  });

  test('no mutation of input objects', async () => {
    const inputSnapshot = JSON.stringify(validBaseInput);

    await engine.generate(validBaseInput);

    assert.strictEqual(JSON.stringify(validBaseInput), inputSnapshot);
  });

  test('missing required input throws BusinessRuleError', async () => {
    await assert.rejects(
      async () => {
        await engine.generate(null as any);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_RESPONSE_INPUT'
    );
  });

  test('malformed/incomplete input (missing scenarioContext)', async () => {
    const incompleteInput = { ...validBaseInput, scenarioContext: undefined as any };
    await assert.rejects(
      async () => {
        await engine.generate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_RESPONSE_INPUT'
    );
  });

  test('malformed/incomplete input (missing simulationResult)', async () => {
    const incompleteInput = { ...validBaseInput, simulationResult: undefined as any };
    await assert.rejects(
      async () => {
        await engine.generate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_RESPONSE_INPUT'
    );
  });

  test('malformed/incomplete input (missing impactAssessment)', async () => {
    const incompleteInput = { ...validBaseInput, impactAssessment: undefined as any };
    await assert.rejects(
      async () => {
        await engine.generate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_RESPONSE_INPUT'
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
        await engine.generate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_RESPONSE_INPUT'
    );
  });
});
