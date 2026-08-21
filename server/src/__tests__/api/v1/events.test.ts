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
});
