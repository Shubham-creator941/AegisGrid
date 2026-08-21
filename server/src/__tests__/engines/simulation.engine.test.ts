import test, { suite } from 'node:test';
import assert from 'node:assert';
import { DeterministicSimulationEngine } from '../../engines/simulation/simulation.engine.js';
import { SimulationInput } from '../../application/interfaces/engines.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

suite('DeterministicSimulationEngine', () => {
  const engine = new DeterministicSimulationEngine();

  const mockNetworkState = {
    id: 'network-1',
    snapshot_version: 1,
    created_at: new Date(),
    created_by: 'user-1',
    description: 'Test Network',
    snapshot_data: { nodes: 10, edges: 15 }
  };

  const mockScenario = {
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
  };

  const mockDisruption = {
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
  };

  const mockAssumptions = [
    {
      id: 'assumption-1',
      scenario_id: 'scenario-1',
      parameter_name: 'capacity_loss_modifier',
      parameter_type: 'capacity_loss',
      parameter_value: 50,
      unit: 'MW',
      source: 'Analyst',
      confidence: 0.8,
      created_at: new Date()
    }
  ];

  const validBaseInput: SimulationInput = {
    networkState: mockNetworkState,
    scenario: mockScenario,
    disruption: mockDisruption,
    assumptions: mockAssumptions
  };

  test('valid simulation input produces deterministic output structure', async () => {
    const result = await engine.simulate(validBaseInput);

    assert.strictEqual(result.calculation_version, '1.0.0-deterministic');
    assert.strictEqual(result.affected_capacity, 350); // HIGH (300) + assumption (50)
    assert.strictEqual(result.available_supply, 650); // 1000 - 350
    assert.strictEqual(result.shortfall, 350);
    assert.strictEqual(result.reserve_level, 0);
    assert.deepStrictEqual(result.network_state, mockNetworkState.snapshot_data);
    
    // Boundary test - no recommendation fields
    assert.strictEqual((result as any).recommended_response_id, undefined);
    assert.strictEqual((result as any).score, undefined);
  });

  test('deterministic repeated execution produces identical outputs', async () => {
    const result1 = await engine.simulate(validBaseInput);
    const result2 = await engine.simulate(validBaseInput);
    const result3 = await engine.simulate(validBaseInput);

    assert.deepStrictEqual(result1, result2);
    assert.deepStrictEqual(result2, result3);
  });

  test('empty/minimal valid collections where permitted (empty assumptions)', async () => {
    const inputWithEmptyAssumptions = { ...validBaseInput, assumptions: [] };
    const result = await engine.simulate(inputWithEmptyAssumptions);

    // HIGH severity = 300 affected, no assumption modifiers
    assert.strictEqual(result.affected_capacity, 300);
    assert.strictEqual(result.available_supply, 700);
  });

  test('boundary values (negative assumption modifiers resulting in zero floor)', async () => {
    const inputBoundary = {
      ...validBaseInput,
      assumptions: [
        { ...mockAssumptions[0], parameter_value: -1000 } // Tries to restore all capacity
      ]
    };
    const result = await engine.simulate(inputBoundary);

    assert.strictEqual(result.affected_capacity, 0); // Floors at 0
    assert.strictEqual(result.available_supply, 1000);
  });

  test('invalid required input throws BusinessRuleError', async () => {
    await assert.rejects(
      async () => {
        await engine.simulate(null as any);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_SIMULATION_INPUT'
    );
  });

  test('malformed/incomplete simulation input (missing networkState)', async () => {
    const incompleteInput = { ...validBaseInput, networkState: undefined as any };
    await assert.rejects(
      async () => {
        await engine.simulate(incompleteInput);
      },
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_SIMULATION_INPUT'
    );
  });

  test('no mutation of input objects', async () => {
    const inputCopy = JSON.parse(JSON.stringify(validBaseInput)); // Deep copy using JSON (safe for this simple mock data, except dates)
    // Restore dates
    inputCopy.networkState.created_at = mockNetworkState.created_at;
    inputCopy.scenario.start_time = mockScenario.start_time;
    inputCopy.scenario.end_time = mockScenario.end_time;
    inputCopy.scenario.created_at = mockScenario.created_at;
    inputCopy.scenario.updated_at = mockScenario.updated_at;
    inputCopy.disruption.occurred_at = mockDisruption.occurred_at;
    inputCopy.disruption.detected_at = mockDisruption.detected_at;
    inputCopy.disruption.created_at = mockDisruption.created_at;
    inputCopy.disruption.updated_at = mockDisruption.updated_at;
    inputCopy.assumptions[0].created_at = mockAssumptions[0].created_at;

    await engine.simulate(validBaseInput);

    assert.deepStrictEqual(validBaseInput, inputCopy);
  });

  test('representative network consequence calculations (CRITICAL severity)', async () => {
    const criticalInput = {
      ...validBaseInput,
      disruption: { ...validBaseInput.disruption, severity: 'CRITICAL' }
    };
    const result = await engine.simulate(criticalInput);

    assert.strictEqual(result.affected_capacity, 550); // CRITICAL (500) + assumption (50)
  });
});
