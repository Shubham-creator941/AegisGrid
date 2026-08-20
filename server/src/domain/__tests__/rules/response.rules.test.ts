import test from 'node:test';
import assert from 'node:assert/strict';
import { ResponseRules } from '../../rules/response.rules.js';
import { BusinessRuleError } from '../../errors/index.js';

test('ResponseRules - validateResponseFeasibility', async (t) => {
  await t.test('accepts feasible response', () => {
    assert.doesNotThrow(() => ResponseRules.validateResponseFeasibility(true));
  });

  await t.test('rejects infeasible response', () => {
    assert.throws(() => ResponseRules.validateResponseFeasibility(false), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'INFEASIBLE_RESPONSE');
      return true;
    });
  });
});
