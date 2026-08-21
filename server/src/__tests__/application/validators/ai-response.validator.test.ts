import test, { suite } from 'node:test';
import assert from 'node:assert';
import { AIResponseValidator } from '../../../application/validators/ai-response.validator.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

suite('AIResponseValidator', () => {
  const validResponse = {
    model_name: 'test-model',
    model_version: 'v1',
    structured_output: { some: 'data' },
    confidence: 0.95
  };

  test('accepts a valid AI response', () => {
    // Should not throw
    AIResponseValidator.validate(validResponse);
    // Structural check ensures input immutability
    assert.strictEqual(validResponse.model_name, 'test-model');
  });

  test('rejects missing or non-object response', () => {
    assert.throws(() => AIResponseValidator.validate(null), (err: any) => {
      return err instanceof BusinessRuleError && err.code === 'INVALID_AI_RESPONSE' && err.message.includes('object');
    });
  });

  test('rejects missing model_name', () => {
    assert.throws(() => AIResponseValidator.validate({ ...validResponse, model_name: undefined }), /valid model_name/);
    assert.throws(() => AIResponseValidator.validate({ ...validResponse, model_name: '' }), /valid model_name/);
  });

  test('rejects missing model_version', () => {
    assert.throws(() => AIResponseValidator.validate({ ...validResponse, model_version: undefined }), /valid model_version/);
    assert.throws(() => AIResponseValidator.validate({ ...validResponse, model_version: '' }), /valid model_version/);
  });

  test('rejects missing structured_output', () => {
    assert.throws(() => AIResponseValidator.validate({ ...validResponse, structured_output: undefined }), /include structured_output/);
  });

  test('rejects missing or invalid confidence', () => {
    assert.throws(() => AIResponseValidator.validate({ ...validResponse, confidence: undefined }), /numeric confidence/);
    assert.throws(() => AIResponseValidator.validate({ ...validResponse, confidence: 'high' }), /numeric confidence/);
    assert.throws(() => AIResponseValidator.validate({ ...validResponse, confidence: NaN }), /numeric confidence/);
  });

  test('preserves architecture boundary by not containing provider logic or raw provider errors', () => {
    // Ensure that validation throws our internal application error, never leaking provider details.
    try {
      AIResponseValidator.validate({ error: 'provider-timeout', message: 'API key invalid' });
      assert.fail('Should have thrown');
    } catch (err: any) {
      assert.ok(err instanceof BusinessRuleError);
      assert.strictEqual(err.code, 'INVALID_AI_RESPONSE');
      assert.ok(!err.message.includes('API key invalid'));
    }
  });
});
