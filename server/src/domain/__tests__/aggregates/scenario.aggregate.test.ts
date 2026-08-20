import test from 'node:test';
import assert from 'node:assert/strict';
import { ScenarioState } from 'shared';
import { Scenario, ScenarioAssumption } from '../../entities/index.js';
import { ScenarioAggregate } from '../../aggregates/scenario.aggregate.js';
import { BusinessRuleError, InvalidStateTransitionError } from '../../errors/index.js';

test('ScenarioAggregate', async (t) => {
  const mockScenario: Scenario = {
    id: 'sc-1',
    name: 'Test Scenario',
    description: 'A test scenario',
    event_id: 'ev-1',
    status: ScenarioState.DRAFT,
    scenario_version: 1,
    start_time: new Date(),
    end_time: new Date(),
    created_by: 'user-1',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockAssumption: ScenarioAssumption = {
    id: 'sa-1',
    scenario_id: 'sc-1',
    parameter_name: 'test_param',
    parameter_type: 'number',
    parameter_value: 100,
    unit: 'kg',
    source: 'user',
    confidence: 0.9,
    created_at: new Date(),
  };

  await t.test('restores aggregate and provides getters', () => {
    const aggregate = ScenarioAggregate.restore(mockScenario, [mockAssumption]);
    assert.equal(aggregate.id, 'sc-1');
    assert.equal(aggregate.status, ScenarioState.DRAFT);
    assert.equal(aggregate.eventId, 'ev-1');
    assert.equal(aggregate.currentScenario.status, ScenarioState.DRAFT);
    assert.equal(aggregate.currentAssumptions.length, 1);
  });

  await t.test('addAssumption allows mutation in DRAFT state', () => {
    const aggregate = ScenarioAggregate.restore(mockScenario, []);
    aggregate.addAssumption(mockAssumption);
    assert.equal(aggregate.currentAssumptions.length, 1);
    assert.equal(aggregate.currentAssumptions[0].id, 'sa-1');
  });

  await t.test('markReady enforces rules and transitions to READY', () => {
    const aggregate = ScenarioAggregate.restore(mockScenario, []);
    
    // Missing risk assessment
    assert.throws(() => aggregate.markReady(true, true, false), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      return true;
    });

    // Valid
    aggregate.markReady(true, true, true);
    assert.equal(aggregate.status, ScenarioState.READY);
  });

  await t.test('beginEvaluation transitions to EVALUATING', () => {
    const aggregate = ScenarioAggregate.restore({ ...mockScenario, status: ScenarioState.READY }, []);
    aggregate.beginEvaluation();
    assert.equal(aggregate.status, ScenarioState.EVALUATING);
  });

  await t.test('addAssumption rejects mutation in EVALUATING state', () => {
    const aggregate = ScenarioAggregate.restore({ ...mockScenario, status: ScenarioState.EVALUATING }, []);
    assert.throws(() => aggregate.addAssumption(mockAssumption), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'SCENARIO_NOT_EDITABLE');
      return true;
    });
  });

  await t.test('state machine protects terminal state', () => {
    const aggregate = ScenarioAggregate.restore({ ...mockScenario, status: ScenarioState.DECIDED }, []);
    assert.throws(() => aggregate.cancel(), (err: Error) => {
      assert(err instanceof InvalidStateTransitionError);
      return true;
    });
  });
});
