import test, { suite } from 'node:test';
import assert from 'node:assert/strict';
import { CreateFacilityService } from '../../application/services/facility/create-facility.service.js';
import { GetFacilityService } from '../../application/services/facility/get-facility.service.js';
import { ListFacilitiesService } from '../../application/services/facility/list-facilities.service.js';
import { UpdateFacilityService } from '../../application/services/facility/update-facility.service.js';
import { FacilityRepository } from '../../repositories/interfaces/facility.repository.js';
import { Facility } from '../../domain/entities/index.js';
import { FacilityType } from '../../domain/enums/index.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

suite('Facility Application Services', () => {
  const mockFacility: Facility = {
    id: 'fac-1',
    name: 'Facility A',
    facility_type: FacilityType.STORAGE,
    country: 'Country X',
    region: 'Region Y',
    capacity: 1000,
    status: 'ACTIVE',
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockRepo: FacilityRepository = {
    findById: async (id) => id === 'fac-1' ? mockFacility : null,
    findByName: async (name) => name === 'Facility A' ? mockFacility : null,
    create: async (data) => ({ ...mockFacility, ...data, id: 'new-fac' }),
    update: async (id, data) => id === 'fac-1' ? { ...mockFacility, ...data } : null,
    list: async (page, pageSize, status) => ({
      data: [mockFacility],
      meta: { page, page_size: pageSize, total: 1, total_pages: 1 }
    })
  };

  test('CreateFacilityService - successfully creates facility', async () => {
    const service = new CreateFacilityService(mockRepo);
    const result = await service.execute({
      name: 'New Facility',
      facility_type: FacilityType.STORAGE,
      country: 'Country Z',
      region: 'Region Z',
      capacity: 500
    });
    
    assert.strictEqual(result.name, 'New Facility');
    assert.strictEqual(result.status, 'ACTIVE');
  });

  test('CreateFacilityService - throws on duplicate name', async () => {
    const service = new CreateFacilityService(mockRepo);
    await assert.rejects(
      () => service.execute({
        name: 'Facility A',
        facility_type: FacilityType.STORAGE,
        country: 'Country Y',
        region: 'Region Y',
        capacity: 100
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'FACILITY_DUPLICATE'
    );
  });

  test('CreateFacilityService - throws on missing name', async () => {
    const service = new CreateFacilityService(mockRepo);
    await assert.rejects(
      () => service.execute({
        name: '',
        facility_type: FacilityType.STORAGE,
        country: 'Country Y',
        region: 'Region Y',
        capacity: 100
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'FACILITY_NAME_REQUIRED'
    );
  });

  test('GetFacilityService - returns facility if found', async () => {
    const service = new GetFacilityService(mockRepo);
    const result = await service.execute({ id: 'fac-1' });
    assert.ok(result);
    assert.strictEqual(result.id, 'fac-1');
  });

  test('GetFacilityService - returns null if not found', async () => {
    const service = new GetFacilityService(mockRepo);
    const result = await service.execute({ id: 'missing' });
    assert.strictEqual(result, null);
  });

  test('ListFacilitiesService - returns paginated result', async () => {
    const service = new ListFacilitiesService(mockRepo);
    const result = await service.execute({ page: 1, pageSize: 10 });
    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.meta.total, 1);
  });

  test('UpdateFacilityService - successfully updates facility', async () => {
    const service = new UpdateFacilityService(mockRepo);
    const result = await service.execute({
      id: 'fac-1',
      name: 'Facility A Updated'
    });
    
    assert.strictEqual(result.name, 'Facility A Updated');
  });

  test('UpdateFacilityService - throws on not found', async () => {
    const service = new UpdateFacilityService(mockRepo);
    await assert.rejects(
      () => service.execute({
        id: 'missing',
        name: 'Missing Facility'
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'FACILITY_NOT_FOUND'
    );
  });

  test('UpdateFacilityService - throws on duplicate name during update', async () => {
    const mockRepoDup: FacilityRepository = {
      ...mockRepo,
      findByName: async (name) => name === 'Facility B' ? { ...mockFacility, id: 'fac-2' } : null
    };
    const service = new UpdateFacilityService(mockRepoDup);
    
    await assert.rejects(
      () => service.execute({
        id: 'fac-1',
        name: 'Facility B'
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'FACILITY_DUPLICATE'
    );
  });
});
