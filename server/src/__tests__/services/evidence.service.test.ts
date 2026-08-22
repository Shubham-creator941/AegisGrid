import test, { suite } from 'node:test';
import assert from 'node:assert';
import { CreateEvidenceService } from '../../application/services/evidence/create-evidence.service.js';
import { ListEvidenceService } from '../../application/services/evidence/list-evidence.service.js';
import { EvidenceRepository } from '../../repositories/interfaces/evidence.repository.js';
import { EventRepository } from '../../repositories/interfaces/event.repository.js';
import { Evidence, Event } from '../../domain/entities/index.js';

suite('Evidence Application Services', () => {
  const mockEvent: Event = {
    id: 'event-1',
    title: 'Test Event',
    description: 'Test',
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
    source_name: 'CNN',
    source_reference: 'url',
    content: 'Flood',
    published_at: new Date(),
    retrieved_at: new Date(),
    confidence: 0.9,
    created_at: new Date()
  };

  test('CreateEvidenceService - creates evidence when event exists', async () => {
    let createdItem: any = null;
    const evidenceRepo = {
      create: async (item: any) => { createdItem = item; return { ...item, id: 'evidence-1' }; }
    } as unknown as EvidenceRepository;

    const eventRepo = {
      findById: async (id: string) => id === 'event-1' ? mockEvent : null
    } as unknown as EventRepository;

    const service = new CreateEvidenceService(evidenceRepo, eventRepo);
    const result = await service.execute({
      event_id: 'event-1',
      source_type: 'NEWS',
      source_name: 'CNN',
      source_reference: 'url',
      content: 'Flood',
      published_at: new Date(),
      retrieved_at: new Date(),
      confidence: 0.9
    });

    assert.ok(result);
    assert.strictEqual(result.id, 'evidence-1');
    assert.strictEqual(createdItem.event_id, 'event-1');
  });

  test('CreateEvidenceService - throws error when event does not exist', async () => {
    const evidenceRepo = {} as unknown as EvidenceRepository;
    const eventRepo = {
      findById: async (id: string) => null
    } as unknown as EventRepository;

    const service = new CreateEvidenceService(evidenceRepo, eventRepo);

    await assert.rejects(async () => {
      await service.execute({
        event_id: 'missing',
        source_type: 'NEWS',
        source_name: 'CNN',
        source_reference: 'url',
        content: 'Flood',
        published_at: new Date(),
        retrieved_at: new Date(),
        confidence: 0.9
      });
    }, /Event not found/);
  });

  test('ListEvidenceService - returns paginated evidence when event exists', async () => {
    const evidenceRepo = {
      listByEventId: async (id: string, page: number, pageSize: number) => ({
        data: [mockEvidence],
        meta: { page, page_size: pageSize, total: 1, total_pages: 1 }
      })
    } as unknown as EvidenceRepository;

    const eventRepo = {
      findById: async (id: string) => id === 'event-1' ? mockEvent : null
    } as unknown as EventRepository;

    const service = new ListEvidenceService(evidenceRepo, eventRepo);
    const result = await service.execute({ event_id: 'event-1', page: 1, pageSize: 10 });

    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.meta.total, 1);
  });

  test('ListEvidenceService - throws error when event does not exist', async () => {
    const evidenceRepo = {} as unknown as EvidenceRepository;
    const eventRepo = {
      findById: async (id: string) => null
    } as unknown as EventRepository;

    const service = new ListEvidenceService(evidenceRepo, eventRepo);

    await assert.rejects(async () => {
      await service.execute({ event_id: 'missing', page: 1, pageSize: 10 });
    }, /Event not found/);
  });
});
