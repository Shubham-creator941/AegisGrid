import test, { suite } from 'node:test';
import assert from 'node:assert/strict';
import { CorridorController } from '../../../api/controllers/corridor.controller.js';
import { CreateCorridorService } from '../../../application/services/corridor/create-corridor.service.js';
import { GetCorridorService } from '../../../application/services/corridor/get-corridor.service.js';
import { ListCorridorsService } from '../../../application/services/corridor/list-corridors.service.js';
import { UpdateCorridorService } from '../../../application/services/corridor/update-corridor.service.js';

suite('CorridorController', () => {
  test('createCorridor returns 201 on success', async () => {
    const mockCreate = {
      execute: async (input: any) => ({ ...input, id: 'cor-1', status: 'ACTIVE' })
    } as unknown as CreateCorridorService;

    const controller = new CorridorController(
      mockCreate,
      {} as GetCorridorService,
      {} as ListCorridorsService,
      {} as UpdateCorridorService
    );

    const req = {
      body: {
        name: 'Corridor A',
        corridor_type: 'ROAD',
        origin: 'City A',
        destination: 'City B',
        capacity: 1000
      }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.createCorridor(req, res, next);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonBody.name, 'Corridor A');
  });

  test('getCorridor returns 200 on success', async () => {
    const mockGet = {
      execute: async (input: any) => ({ id: input.id, name: 'Corridor A' })
    } as unknown as GetCorridorService;

    const controller = new CorridorController(
      {} as CreateCorridorService,
      mockGet,
      {} as ListCorridorsService,
      {} as UpdateCorridorService
    );

    const req = {
      params: { id: 'cor-1' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.getCorridor(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.id, 'cor-1');
  });

  test('getCorridor returns 404 if not found', async () => {
    const mockGet = {
      execute: async (input: any) => null
    } as unknown as GetCorridorService;

    const controller = new CorridorController(
      {} as CreateCorridorService,
      mockGet,
      {} as ListCorridorsService,
      {} as UpdateCorridorService
    );

    const req = {
      params: { id: 'missing' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.getCorridor(req, res, next);

    assert.equal(res.statusCode, 404);
  });

  test('listCorridors returns 200 and paginates', async () => {
    const mockList = {
      execute: async (input: any) => ({
        data: [{ id: 'cor-1' }],
        meta: { page: input.page, page_size: input.pageSize, total: 1, total_pages: 1 }
      })
    } as unknown as ListCorridorsService;

    const controller = new CorridorController(
      {} as CreateCorridorService,
      {} as GetCorridorService,
      mockList,
      {} as UpdateCorridorService
    );

    const req = {
      query: { page: '2', page_size: '5', status: 'ACTIVE' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.listCorridors(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.meta.page, 2);
    assert.equal(res.jsonBody.meta.page_size, 5);
  });

  test('updateCorridor returns 200 on success', async () => {
    const mockUpdate = {
      execute: async (input: any) => ({ ...input, name: 'Corridor B' })
    } as unknown as UpdateCorridorService;

    const controller = new CorridorController(
      {} as CreateCorridorService,
      {} as GetCorridorService,
      {} as ListCorridorsService,
      mockUpdate
    );

    const req = {
      params: { id: 'cor-1' },
      body: { name: 'Corridor B' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.updateCorridor(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.name, 'Corridor B');
  });
});
