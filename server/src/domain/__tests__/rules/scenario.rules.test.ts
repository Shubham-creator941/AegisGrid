import test from 'node:test';
import assert from 'node:assert/strict';
import { ScenarioState } from 'shared';
import { ScenarioRules } from '../../rules/scenario.rules.js';
import { BusinessRuleError } from '../../errors/index.js';

test('ScenarioRules - validateReadyForEvaluation', async (t) => {
  await t.test('accepts fully ready DRAFT scenario', () => {
    assert.doesNotThrow(() => ScenarioRules.validateReadyForEvaluation(ScenarioState.DRAFT, true, true, true));
  });

  await t.test('accepts fully ready READY scenario', () => {
    assert.doesNotThrow(() => ScenarioRules.validateReadyForEvaluation(ScenarioState.READY, true, true, true));
  });

  await t.test('rejects invalid state', () => {
    assert.throws(() => ScenarioRules.validateReadyForEvaluation(ScenarioState.EVALUATING, true, true, true), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'SCENARIO_NOT_READY');
      return true;
    });
  });

  await t.test('rejects missing event', () => {
    assert.throws(() => ScenarioRules.validateReadyForEvaluation(ScenarioState.DRAFT, false, true, true), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'SCENARIO_NOT_READY');
      return true;
    });
  });

  await t.test('rejects missing evidence/analysis', () => {
    assert.throws(() => ScenarioRules.validateReadyForEvaluation(ScenarioState.DRAFT, true, false, true), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'SCENARIO_NOT_READY');
      return true;
    });
  });

  await t.test('rejects missing risk assessment', () => {
    assert.throws(() => ScenarioRules.validateReadyForEvaluation(ScenarioState.DRAFT, true, true, false), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'SCENARIO_NOT_READY');
      return true;
    });
  });
});

test('ScenarioRules - assertScenarioIsEditable', async (t) => {
  await t.test('accepts editable states', () => {
    assert.doesNotThrow(() => ScenarioRules.assertScenarioIsEditable(ScenarioState.DRAFT));
    assert.doesNotThrow(() => ScenarioRules.assertScenarioIsEditable(ScenarioState.READY));
  });

  await t.test('rejects uneditable states', () => {
    const uneditableStates = [
      ScenarioState.EVALUATING,
      ScenarioState.EVALUATED,
      ScenarioState.RECOMMENDED,
      ScenarioState.DECIDED,
      ScenarioState.CANCELLED,
    ];

    for (const state of uneditableStates) {
      assert.throws(() => ScenarioRules.assertScenarioIsEditable(state), (err: Error) => {
        assert(err instanceof BusinessRuleError);
        assert.equal(err.code, 'SCENARIO_NOT_EDITABLE');
        return true;
      });
    }
  });
});
