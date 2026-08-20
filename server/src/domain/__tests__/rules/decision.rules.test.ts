import test from 'node:test';
import assert from 'node:assert/strict';
import { DecisionRules } from '../../rules/decision.rules.js';
import { BusinessRuleError } from '../../errors/index.js';

test('DecisionRules - assertDecisionNotExists', async (t) => {
  await t.test('accepts when no decision exists', () => {
    assert.doesNotThrow(() => DecisionRules.assertDecisionNotExists(false));
  });

  await t.test('rejects when decision already exists', () => {
    assert.throws(() => DecisionRules.assertDecisionNotExists(true), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'DECISION_ALREADY_RECORDED');
      return true;
    });
  });
});
