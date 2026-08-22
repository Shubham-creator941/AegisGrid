import test, { suite } from 'node:test';
import assert from 'node:assert/strict';
import { CreateSupplyFlowService } from '../../application/services/supply-flow/create-supply-flow.service.js';
import { GetSupplyFlowService } from '../../application/services/supply-flow/get-supply-flow.service.js';
import { ListSupplyFlowsService } from '../../application/services/supply-flow/list-supply-flows.service.js';
import { UpdateSupplyFlowService } from '../../application/services/supply-flow/update-supply-flow.service.js';
import { SupplyFlowRepository } from '../../repositories/interfaces/supply-flow.repository.js';
import { SupplierRepository } from '../../repositories/interfaces/supplier.repository.js';
import { FacilityRepository } from '../../repositories/interfaces/facility.repository.js';
import { CorridorRepository } from '../../repositories/interfaces/corridor.repository.js';
import { SupplyFlow } from '../../domain/entities/index.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

suite('SupplyFlow Application Services', () => {
  const mockSupplyFlow: SupplyFlow = {
    id: 'sf-1',
    supplier_id: 'sup-1',
    origin_facility_id: 'fac-1',
    destination_facility_id: 'fac-2',
    corridor_id: 'cor-1',
    commodity: 'ENERGY',
    capacity: 1000,
    baseline_volume: 800,
    status: 'ACTIVE',
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockRepo: SupplyFlowRepository = {
    findById: async (id: string) => id === 'sf-1' ? mockSupplyFlow : null,
    create: async (data) => ({ ...mockSupplyFlow, ...data, id: 'new-sf' }),
    update: async (id: string, data) => id === 'sf-1' ? { ...mockSupplyFlow, ...data } : null,
    list: async (page, pageSize) => ({
      data: [mockSupplyFlow],
      meta: { page, page_size: pageSize, total: 1, total_pages: 1 }
    })
  };

  const mockSupRepo: SupplierRepository = {
    findById: async (id: string) => id === 'sup-1' ? { status: 'ACTIVE' } as any : null,
  } as any;
  const mockFacRepo: FacilityRepository = {
    findById: async (id: string) => (id === 'fac-1' || id === 'fac-2') ? { status: 'ACTIVE' } as any : null,
  } as any;
  const mockCorRepo: CorridorRepository = {
    findById: async (id: string) => id === 'cor-1' ? { status: 'ACTIVE' } as any : null,
  } as any;

  test('CreateSupplyFlowService - successfully creates', async () => {
    const service = new CreateSupplyFlowService(mockRepo, mockSupRepo, mockFacRepo, mockCorRepo);
    const result = await service.execute({
      supplier_id: 'sup-1',
      origin_facility_id: 'fac-1',
      destination_facility_id: 'fac-2',
      corridor_id: 'cor-1',
      commodity: 'ENERGY',
      capacity: 1000,
      baseline_volume: 800
    });
    
    assert.strictEqual(result.capacity, 1000);
    assert.strictEqual(result.status, 'ACTIVE');
  });

  test('CreateSupplyFlowService - throws if baseline > capacity', async () => {
    const service = new CreateSupplyFlowService(mockRepo, mockSupRepo, mockFacRepo, mockCorRepo);
    await assert.rejects(
      () => service.execute({
        supplier_id: 'sup-1',
        origin_facility_id: 'fac-1',
        destination_facility_id: 'fac-2',
        corridor_id: 'cor-1',
        commodity: 'ENERGY',
        capacity: 500,
        baseline_volume: 800
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'BASELINE_EXCEEDS_CAPACITY'
    );
  });

  test('CreateSupplyFlowService - throws if invalid capacity', async () => {
    const service = new CreateSupplyFlowService(mockRepo, mockSupRepo, mockFacRepo, mockCorRepo);
    await assert.rejects(
      () => service.execute({
        supplier_id: 'sup-1',
        origin_facility_id: 'fac-1',
        destination_facility_id: 'fac-2',
        corridor_id: 'cor-1',
        commodity: 'ENERGY',
        capacity: -10,
        baseline_volume: 0
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'INVALID_CAPACITY'
    );
  });

  test('CreateSupplyFlowService - throws if missing supplier', async () => {
    const service = new CreateSupplyFlowService(mockRepo, mockSupRepo, mockFacRepo, mockCorRepo);
    await assert.rejects(
      () => service.execute({
        supplier_id: 'missing',
        origin_facility_id: 'fac-1',
        destination_facility_id: 'fac-2',
        corridor_id: 'cor-1',
        commodity: 'ENERGY',
        capacity: 1000,
        baseline_volume: 800
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'SUPPLIER_NOT_FOUND'
    );
  });

  test('GetSupplyFlowService - returns if found', async () => {
    const service = new GetSupplyFlowService(mockRepo);
    const result = await service.execute({ id: 'sf-1' });
    assert.ok(result);
  });

  test('UpdateSupplyFlowService - successfully updates', async () => {
    const service = new UpdateSupplyFlowService(mockRepo, mockSupRepo, mockFacRepo, mockCorRepo);
    const result = await service.execute({
      id: 'sf-1',
      capacity: 2000
    });
    
    assert.strictEqual(result.capacity, 2000);
  });

  test('UpdateSupplyFlowService - validates new baseline', async () => {
    const service = new UpdateSupplyFlowService(mockRepo, mockSupRepo, mockFacRepo, mockCorRepo);
    await assert.rejects(
      () => service.execute({
        id: 'sf-1',
        baseline_volume: 1500 // capacity is 1000
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'BASELINE_EXCEEDS_CAPACITY'
    );
  });
});
