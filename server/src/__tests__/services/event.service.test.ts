import test, { suite } from 'node:test';
import assert from 'node:assert';
import { GetEventService } from '../../application/services/event/get-event.service.js';
import { ListEventsService } from '../../application/services/event/list-events.service.js';
import { EventRepository } from '../../repositories/interfaces/event.repository.js';
import { Event } from '../../domain/entities/index.js';

suite('Event Application Services', () => {
  const mockEvent: Event = {
    id: 'event-1',
    title: 'Test',
    description: 'Test Event',
    event_type: 'NATURAL_DISASTER' as any,
    severity: 'HIGH' as any,
    status: 'DETECTED' as any,
    affected_region: 'US-West',
    created_at: new Date(),
    updated_at: new Date()
  };

  test('GetEventService - returns event if found', async () => {
    const mockRepo = {
      findById: async (id: string) => id === 'event-1' ? mockEvent : null
    } as unknown as EventRepository;

    const service = new GetEventService(mockRepo);
    const result = await service.execute({ event_id: 'event-1' });

    assert.ok(result);
    assert.strictEqual(result.id, 'event-1');
  });

  test('GetEventService - returns null if not found', async () => {
    const mockRepo = {
      findById: async (id: string) => null
    } as unknown as EventRepository;

    const service = new GetEventService(mockRepo);
    const result = await service.execute({ event_id: 'missing' });

    assert.strictEqual(result, null);
  });

  test('ListEventsService - returns paginated result', async () => {
    const mockRepo = {
      list: async (page: number, pageSize: number) => ({
        data: [mockEvent],
        meta: { page, page_size: pageSize, total: 1, total_pages: 1 }
      })
    } as unknown as EventRepository;

    const service = new ListEventsService(mockRepo);
    const result = await service.execute({ page: 2, pageSize: 5 });

    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.meta.page, 2);
    assert.strictEqual(result.meta.page_size, 5);
  });
});
