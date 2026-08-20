import test from 'node:test';
import assert from 'node:assert/strict';
import { NetworkRules } from '../../rules/network.rules.js';
import { BusinessRuleError } from '../../errors/index.js';

test('NetworkRules - validateSupplyFlow', async (t) => {
  await t.test('accepts valid boundary conditions', () => {
    assert.doesNotThrow(() => NetworkRules.validateSupplyFlow(100, 100)); // baseline = capacity
    assert.doesNotThrow(() => NetworkRules.validateSupplyFlow(100, 0));   // baseline = 0
    assert.doesNotThrow(() => NetworkRules.validateSupplyFlow(100, 50));  // baseline < capacity
  });

  await t.test('rejects negative capacity', () => {
    assert.throws(() => NetworkRules.validateSupplyFlow(0, 0), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'DOMAIN_CONSTRAINT_VIOLATION');
      return true;
    });
    
    assert.throws(() => NetworkRules.validateSupplyFlow(-10, 0), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      return true;
    });
  });

  await t.test('rejects negative baseline volume', () => {
    assert.throws(() => NetworkRules.validateSupplyFlow(100, -1), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'DOMAIN_CONSTRAINT_VIOLATION');
      return true;
    });
  });

  await t.test('rejects baseline volume exceeding capacity', () => {
    assert.throws(() => NetworkRules.validateSupplyFlow(100, 101), (err: Error) => {
      assert(err instanceof BusinessRuleError);
      assert.equal(err.code, 'DOMAIN_CONSTRAINT_VIOLATION');
      return true;
    });
  });
});
