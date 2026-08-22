import test, { suite } from 'node:test';
import assert from 'node:assert';
import { EventAnalysisService } from '../../../application/services/analysis/event-analysis.service.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';
import { Event, Evidence, AIAnalysis } from '../../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

suite('EventAnalysisService', () => {
  const mockEvent: Event = {
    id: 'event-1',
    title: 'Test',
    description: 'Test Event',
    event_type: 'WEATHER' as any,
    severity: 'HIGH' as any,
    status: 'DETECTED' as any,
    affected_region: 'US',
    occurred_at: new Date(),
    detected_at: new Date(), 
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockEvidence: Evidence = {
    id: 'evidence-1',
    event_id: 'event-1',
    source_type: 'NEWS',
    source_name: 'Test Source',
    source_reference: 'http://test',
    content: 'Some data',
    published_at: new Date(),
    retrieved_at: new Date(),
    confidence: 0.8,
    created_at: new Date()
  };

  const mockTxManager = {
    execute: async <T>(cb: () => Promise<T>): Promise<T> => {
      return cb();
    }
  };

  test('rejects when event is not found', async () => {
    const eventRepo = { findById: async () => null } as any;
    const service = new EventAnalysisService(eventRepo, {} as any, {} as any, {} as any, mockTxManager as any);

    await assert.rejects(
      async () => service.analyzeEvent('unknown-id'),
      /Event with ID unknown-id not found/
    );
  });

  test('provider failure normalizes without leaking', async () => {
    const eventRepo = { findById: async () => mockEvent } as any;
    const evidenceRepo = { 
      listByEventId: async () => ({ data: [mockEvidence], meta: {} }) 
    } as any;
    
    const aiAdapter = {
      analyze: async () => { throw new Error('Secret Provider Stack Trace'); }
    } as any;

    const service = new EventAnalysisService(eventRepo, evidenceRepo, {} as any, aiAdapter, mockTxManager as any);

    let error: any;
    try {
      await service.analyzeEvent('event-1');
    } catch (e) {
      error = e;
    }

    assert.ok(error instanceof BusinessRuleError);
    assert.strictEqual(error.code, 'AI_PROVIDER_ERROR');
    assert.ok(!error.message.includes('Secret Provider Stack Trace'));
  });

  test('invalid AI response causes deterministic failure and no persistence', async () => {
    const eventRepo = { findById: async () => mockEvent } as any;
    const evidenceRepo = { listByEventId: async () => ({ data: [mockEvidence], meta: {} }) } as any;
    
    // Missing structured_output makes it invalid
    const aiAdapter = {
      analyze: async () => ({
        model_name: 'test-model',
        model_version: 'v1',
        confidence: 0.9
      })
    } as any;

    let persisted = false;
    const aiAnalysisRepo = {
      create: async () => { persisted = true; }
    } as any;

    const service = new EventAnalysisService(eventRepo, evidenceRepo, aiAnalysisRepo, aiAdapter, mockTxManager as any);

    await assert.rejects(
      async () => service.analyzeEvent('event-1'),
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_AI_RESPONSE'
    );
    assert.strictEqual(persisted, false);
  });

  test('valid AI response creates correct entity and persists', async () => {
    const eventRepo = { findById: async () => mockEvent } as any;
    const evidenceRepo = { listByEventId: async () => ({ data: [mockEvidence], meta: {} }) } as any;
    
    const aiAdapter = {
      analyze: async () => ({
        model_name: 'test-model',
        model_version: 'v1',
        structured_output: { recommendation: 'do nothing' },
        confidence: 0.95
      })
    } as any;

    let createdAnalysis: any = null;
    const aiAnalysisRepo = {
      findByEventId: async () => null,
      create: async (analysis: any) => {
        createdAnalysis = analysis;
        return { ...analysis, id: 'analysis-1', created_at: new Date() };
      }
    } as any;

    const service = new EventAnalysisService(eventRepo, evidenceRepo, aiAnalysisRepo, aiAdapter, mockTxManager as any);

    const result = await service.analyzeEvent('event-1');
    
    assert.ok(createdAnalysis);
    assert.strictEqual(createdAnalysis.event_id, 'event-1');
    assert.strictEqual(createdAnalysis.model_name, 'test-model');
    assert.strictEqual(createdAnalysis.analysis_version, 1);
    assert.deepStrictEqual(createdAnalysis.structured_output, { recommendation: 'do nothing' });
    
    assert.strictEqual(result.id, 'analysis-1');
  });

  test('subsequent valid AI response increments version', async () => {
    const eventRepo = { findById: async () => mockEvent } as any;
    const evidenceRepo = { listByEventId: async () => ({ data: [], meta: {} }) } as any;
    
    const aiAdapter = {
      analyze: async () => ({
        model_name: 'test-model',
        model_version: 'v2',
        structured_output: {},
        confidence: 0.8
      })
    } as any;

    const aiAnalysisRepo = {
      findByEventId: async () => ({ analysis_version: 1 }),
      create: async (analysis: any) => analysis
    } as any;

    const service = new EventAnalysisService(eventRepo, evidenceRepo, aiAnalysisRepo, aiAdapter, mockTxManager as any);

    const result = await service.analyzeEvent('event-1');
    assert.strictEqual(result.analysis_version, 2);
  });
});
