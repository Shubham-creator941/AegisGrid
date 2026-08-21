import test from 'node:test';
import assert from 'node:assert/strict';
import { EventController } from '../../../api/controllers/event.controller.js';
import { CreateEventService } from '../../../application/services/event/create-event.service.js';

test('EventController', async (t) => {
  await t.test('createEvent returns 201 on success', async () => {
    const mockService = {
      execute: async (input: any) => ({ ...input, id: 'event-1' })
    } as unknown as CreateEventService;

    const controller = new EventController(mockService);

    const req = {
      body: {
        title: 'Flood',
        description: 'A flood',
        event_type: 'WEATHER',
        severity: 'HIGH',
        affected_region: 'North'
      }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    let nextCalled = false;
    const next = (err?: any) => { nextCalled = true; };

    await controller.createEvent(req, res, next);

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonBody.id, 'event-1');
  });

  await t.test('createEvent returns 400 on missing fields', async () => {
    const mockService = {
      execute: async () => ({})
    } as unknown as CreateEventService;

    const controller = new EventController(mockService);

    const req = {
      body: { title: 'Flood' } // missing description, etc.
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.createEvent(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonBody.error, 'Bad Request');
  });

  await t.test('getEvent returns 200 and event on success', async () => {
    const mockGetService = {
      execute: async () => ({ id: 'event-1', title: 'Flood' })
    } as unknown as any;

    const controller = new EventController({} as any, mockGetService, {} as any);

    const req = { params: { eventId: 'event-1' } } as any;
    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;
    const next = (err?: any) => {};

    await controller.getEvent(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.id, 'event-1');
  });

  await t.test('getEvent returns 404 when event not found', async () => {
    const mockGetService = {
      execute: async () => null
    } as unknown as any;

    const controller = new EventController({} as any, mockGetService, {} as any);

    const req = { params: { eventId: 'event-1' } } as any;
    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;
    const next = (err?: any) => {};

    await controller.getEvent(req, res, next);

    assert.equal(res.statusCode, 404);
    assert.equal(res.jsonBody.error, 'Not Found');
  });

  await t.test('listEvents returns 200 and paginated list', async () => {
    const mockListService = {
      execute: async () => ({ data: [{ id: 'event-1' }], meta: { page: 1, page_size: 10, total: 1, total_pages: 1 } })
    } as unknown as any;

    const controller = new EventController({} as any, {} as any, mockListService);

    const req = { query: { page: '1', pageSize: '10' } } as any;
    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;
    const next = (err?: any) => {};

    await controller.listEvents(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.data.length, 1);
    assert.equal(res.jsonBody.meta.total, 1);
  });
});
