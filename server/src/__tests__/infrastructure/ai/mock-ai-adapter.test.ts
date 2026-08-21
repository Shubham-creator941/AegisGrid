import test, { suite } from 'node:test';
import assert from 'node:assert';
import { MockAIAdapter } from '../../../infrastructure/ai/mock-ai-adapter.js';
import { Event } from '../../../domain/entities/index.js';

suite('MockAIAdapter', () => {
  const mockEvent: Event = {
    id: 'event-1',
    title: 'Test Event',
    description: 'Test',
    event_type: 'WEATHER' as any,
    severity: 'HIGH' as any,
    status: 'DETECTED' as any,
    affected_region: 'US',
    created_at: new Date(),
    updated_at: new Date()
  };

  test('MockAIAdapter - fails safely if configuration is missing', () => {
    assert.throws(() => {
      new MockAIAdapter('');
    }, /AI Provider Configuration Error: Missing API Key/);
  });

  test('MockAIAdapter - successful response is converted into expected contract', async () => {
    const adapter = new MockAIAdapter('test-key');
    const result = await adapter.analyze({
      event: mockEvent,
      evidence: []
    });

    assert.strictEqual(result.model_name, 'mock-ai-model');
    assert.strictEqual(result.model_version, '1.0.0');
    assert.strictEqual(result.confidence, 0.95);
    assert.ok(result.structured_output);
  });

  test('MockAIAdapter - provider failure becomes a controlled error and leaks no credentials', async () => {
    const adapter = new MockAIAdapter('secret-test-key');
    
    let error: any = null;
    try {
      await adapter.analyze({
        event: { ...mockEvent, description: 'error-test' },
        evidence: []
      });
    } catch (err) {
      error = err;
    }

    assert.ok(error);
    assert.strictEqual(error.message, 'Mock AI Provider Network Error');
    // Ensure no credentials leak
    assert.ok(!error.message.includes('secret-test-key'));
  });

  test('MockAIAdapter - malformed response does not falsely report success (structural check)', async () => {
    const adapter = new MockAIAdapter('test-key');
    
    await assert.rejects(async () => {
      await adapter.analyze({
        event: { ...mockEvent, description: 'malformed-test' },
        evidence: []
      });
    }, /AI Provider Error: Malformed response from provider/);
  });
});
