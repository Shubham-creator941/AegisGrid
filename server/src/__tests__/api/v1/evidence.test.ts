import test from 'node:test';
import assert from 'node:assert/strict';
import { EvidenceController } from '../../../api/controllers/evidence.controller.js';

test('EvidenceController', async (t) => {
  await t.test('createEvidence returns 201 on success', async () => {
    const mockCreateService = {
      execute: async (input: any) => ({ ...input, id: 'evidence-1' })
    } as any;

    const controller = new EvidenceController(mockCreateService, {} as any);

    const req = {
      params: { eventId: 'event-1' },
      body: {
        source_type: 'NEWS',
        source_name: 'CNN',
        source_reference: 'url',
        content: 'Flood',
        published_at: new Date().toISOString(),
        retrieved_at: new Date().toISOString(),
        confidence: 0.9
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

    await controller.createEvidence(req, res, next);

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonBody.id, 'evidence-1');
  });

  await t.test('createEvidence returns 400 on missing fields', async () => {
    const controller = new EvidenceController({} as any, {} as any);

    const req = {
      params: { eventId: 'event-1' },
      body: { source_type: 'NEWS' } // missing fields
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.createEvidence(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(res.jsonBody.error, 'Bad Request');
  });

  await t.test('createEvidence returns 404 when Event not found', async () => {
    const mockCreateService = {
      execute: async () => { throw new Error('Event not found'); }
    } as any;

    const controller = new EvidenceController(mockCreateService, {} as any);

    const req = {
      params: { eventId: 'event-1' },
      body: {
        source_type: 'NEWS',
        source_name: 'CNN',
        source_reference: 'url',
        content: 'Flood',
        published_at: new Date().toISOString(),
        retrieved_at: new Date().toISOString(),
        confidence: 0.9
      }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;
    const next = (err?: any) => {};

    await controller.createEvidence(req, res, next);

    assert.equal(res.statusCode, 404);
  });

  await t.test('listEvidence returns 200 on success', async () => {
    const mockListService = {
      execute: async () => ({ data: [{ id: 'evidence-1' }], meta: { page: 1, page_size: 10, total: 1, total_pages: 1 } })
    } as any;

    const controller = new EvidenceController({} as any, mockListService);

    const req = {
      params: { eventId: 'event-1' },
      query: { page: '1', pageSize: '10' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;
    const next = (err?: any) => {};

    await controller.listEvidence(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.data.length, 1);
  });

  await t.test('listEvidence returns 404 when Event not found', async () => {
    const mockListService = {
      execute: async () => { throw new Error('Event not found'); }
    } as any;

    const controller = new EvidenceController({} as any, mockListService);

    const req = {
      params: { eventId: 'event-1' },
      query: { page: '1', pageSize: '10' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;
    const next = (err?: any) => {};

    await controller.listEvidence(req, res, next);

    assert.equal(res.statusCode, 404);
  });
});
