import test, { suite } from 'node:test';
import assert from 'node:assert/strict';
import { SupplierController } from '../../../api/controllers/supplier.controller.js';
import { CreateSupplierService } from '../../../application/services/supplier/create-supplier.service.js';
import { GetSupplierService } from '../../../application/services/supplier/get-supplier.service.js';
import { ListSuppliersService } from '../../../application/services/supplier/list-suppliers.service.js';
import { UpdateSupplierService } from '../../../application/services/supplier/update-supplier.service.js';
import { SupplierType } from '../../../domain/enums/index.js';

suite('SupplierController', () => {
  test('createSupplier returns 201 on success', async () => {
    const mockCreate = {
      execute: async (input: any) => ({ ...input, id: 'sup-1', status: 'ACTIVE' })
    } as unknown as CreateSupplierService;

    const controller = new SupplierController(
      mockCreate,
      {} as GetSupplierService,
      {} as ListSuppliersService,
      {} as UpdateSupplierService
    );

    const req = {
      body: {
        name: 'Supplier A',
        country: 'Country X',
        supplier_type: SupplierType.STATE
      }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.createSupplier(req, res, next);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonBody.name, 'Supplier A');
  });

  test('getSupplier returns 200 on success', async () => {
    const mockGet = {
      execute: async (input: any) => ({ id: input.id, name: 'Supplier A' })
    } as unknown as GetSupplierService;

    const controller = new SupplierController(
      {} as CreateSupplierService,
      mockGet,
      {} as ListSuppliersService,
      {} as UpdateSupplierService
    );

    const req = {
      params: { id: 'sup-1' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.getSupplier(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.id, 'sup-1');
  });

  test('getSupplier returns 404 if not found', async () => {
    const mockGet = {
      execute: async (input: any) => null
    } as unknown as GetSupplierService;

    const controller = new SupplierController(
      {} as CreateSupplierService,
      mockGet,
      {} as ListSuppliersService,
      {} as UpdateSupplierService
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

    await controller.getSupplier(req, res, next);

    assert.equal(res.statusCode, 404);
  });

  test('listSuppliers returns 200 and paginates', async () => {
    const mockList = {
      execute: async (input: any) => ({
        data: [{ id: 'sup-1' }],
        meta: { page: input.page, page_size: input.pageSize, total: 1, total_pages: 1 }
      })
    } as unknown as ListSuppliersService;

    const controller = new SupplierController(
      {} as CreateSupplierService,
      {} as GetSupplierService,
      mockList,
      {} as UpdateSupplierService
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

    await controller.listSuppliers(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.meta.page, 2);
    assert.equal(res.jsonBody.meta.page_size, 5);
  });

  test('updateSupplier returns 200 on success', async () => {
    const mockUpdate = {
      execute: async (input: any) => ({ ...input, name: 'Supplier B' })
    } as unknown as UpdateSupplierService;

    const controller = new SupplierController(
      {} as CreateSupplierService,
      {} as GetSupplierService,
      {} as ListSuppliersService,
      mockUpdate
    );

    const req = {
      params: { id: 'sup-1' },
      body: { name: 'Supplier B' }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.updateSupplier(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(res.jsonBody.name, 'Supplier B');
  });
});
