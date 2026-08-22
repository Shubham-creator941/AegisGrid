import test, { suite } from 'node:test';
import assert from 'node:assert/strict';
import { FacilityController } from '../../../api/controllers/facility.controller.js';
import { CreateFacilityService } from '../../../application/services/facility/create-facility.service.js';
import { GetFacilityService } from '../../../application/services/facility/get-facility.service.js';
import { ListFacilitiesService } from '../../../application/services/facility/list-facilities.service.js';
import { UpdateFacilityService } from '../../../application/services/facility/update-facility.service.js';
import { FacilityType } from '../../../domain/enums/index.js';

suite('FacilityController', () => {
  test('createFacility returns 201 on success', async () => {
    const mockCreate = {
      execute: async (input: any) => ({ ...input, id: 'fac-1', status: 'ACTIVE' })
    } as unknown as CreateFacilityService;

    const controller = new FacilityController(
      mockCreate,
      {} as GetFacilityService,
      {} as ListFacilitiesService,
      {} as UpdateFacilityService
    );

    const req = {
      body: {
        name: 'Facility A',
        facility_type: FacilityType.STORAGE,
        country: 'Country X',
        region: 'Region X',
        capacity: 100
      }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.createFacility(req, res, next);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonBody.name, 'Facility A');
  });

  test('getFacility returns 200 on success', async () => {
    const mockGet = {
      execute: async (input: any) => ({ id: input.id, name: 'Facility A' })
    } as unknown as GetFacilityService;

    const controller = new FacilityController(
      {} as CreateFacilityService,
      mockGet,
      {} as ListFacilitiesService,
      {} as UpdateFacilityService
    );

    const req = {
      params: { id: 'fac-1' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.getFacility(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.id, 'fac-1');
  });

  test('getFacility returns 404 if not found', async () => {
    const mockGet = {
      execute: async (input: any) => null
    } as unknown as GetFacilityService;

    const controller = new FacilityController(
      {} as CreateFacilityService,
      mockGet,
      {} as ListFacilitiesService,
      {} as UpdateFacilityService
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

    await controller.getFacility(req, res, next);

    assert.equal(res.statusCode, 404);
  });

  test('listFacilities returns 200 and paginates', async () => {
    const mockList = {
      execute: async (input: any) => ({
        data: [{ id: 'fac-1' }],
        meta: { page: input.page, page_size: input.pageSize, total: 1, total_pages: 1 }
      })
    } as unknown as ListFacilitiesService;

    const controller = new FacilityController(
      {} as CreateFacilityService,
      {} as GetFacilityService,
      mockList,
      {} as UpdateFacilityService
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

    await controller.listFacilities(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.meta.page, 2);
    assert.equal(res.jsonBody.meta.page_size, 5);
  });

  test('updateFacility returns 200 on success', async () => {
    const mockUpdate = {
      execute: async (input: any) => ({ ...input, name: 'Facility B' })
    } as unknown as UpdateFacilityService;

    const controller = new FacilityController(
      {} as CreateFacilityService,
      {} as GetFacilityService,
      {} as ListFacilitiesService,
      mockUpdate
    );

    const req = {
      params: { id: 'fac-1' },
      body: { name: 'Facility B' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.updateFacility(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.name, 'Facility B');
  });
});
