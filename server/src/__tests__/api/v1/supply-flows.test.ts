import test, { suite } from 'node:test';
import assert from 'node:assert/strict';
import { SupplyFlowController } from '../../../api/controllers/supply-flow.controller.js';
import { CreateSupplyFlowService } from '../../../application/services/supply-flow/create-supply-flow.service.js';
import { GetSupplyFlowService } from '../../../application/services/supply-flow/get-supply-flow.service.js';
import { ListSupplyFlowsService } from '../../../application/services/supply-flow/list-supply-flows.service.js';
import { UpdateSupplyFlowService } from '../../../application/services/supply-flow/update-supply-flow.service.js';

suite('SupplyFlowController', () => {
  test('createSupplyFlow returns 201 on success', async () => {
    const mockCreate = {
      execute: async (input: any) => ({ ...input, id: 'sf-1', status: 'ACTIVE' })
    } as unknown as CreateSupplyFlowService;

    const controller = new SupplyFlowController(
      mockCreate,
      {} as GetSupplyFlowService,
      {} as ListSupplyFlowsService,
      {} as UpdateSupplyFlowService
    );

    const req = {
      body: {
        supplier_id: 'sup-1',
        origin_facility_id: 'fac-1',
        destination_facility_id: 'fac-2',
        corridor_id: 'cor-1',
        commodity: 'ENERGY',
        capacity: 1000,
        baseline_volume: 800
      }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.createSupplyFlow(req, res, next);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonBody.capacity, 1000);
  });

  test('getSupplyFlow returns 200 on success', async () => {
    const mockGet = {
      execute: async (input: any) => ({ id: input.id, capacity: 1000 })
    } as unknown as GetSupplyFlowService;

    const controller = new SupplyFlowController(
      {} as CreateSupplyFlowService,
      mockGet,
      {} as ListSupplyFlowsService,
      {} as UpdateSupplyFlowService
    );

    const req = {
      params: { id: 'sf-1' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.getSupplyFlow(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.id, 'sf-1');
  });

  test('listSupplyFlows returns 200 and paginates', async () => {
    const mockList = {
      execute: async (input: any) => ({
        data: [{ id: 'sf-1' }],
        meta: { page: input.page, page_size: input.pageSize, total: 1, total_pages: 1 }
      })
    } as unknown as ListSupplyFlowsService;

    const controller = new SupplyFlowController(
      {} as CreateSupplyFlowService,
      {} as GetSupplyFlowService,
      mockList,
      {} as UpdateSupplyFlowService
    );

    const req = {
      query: { page: '2', page_size: '5' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.listSupplyFlows(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.meta.page, 2);
  });

  test('updateSupplyFlow returns 200 on success', async () => {
    const mockUpdate = {
      execute: async (input: any) => ({ ...input, capacity: 2000 })
    } as unknown as UpdateSupplyFlowService;

    const controller = new SupplyFlowController(
      {} as CreateSupplyFlowService,
      {} as GetSupplyFlowService,
      {} as ListSupplyFlowsService,
      mockUpdate
    );

    const req = {
      params: { id: 'sf-1' },
      body: { capacity: 2000 }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.updateSupplyFlow(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.capacity, 2000);
  });
});
