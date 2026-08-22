import test, { suite } from 'node:test';
import assert from 'node:assert/strict';
import { CreateCorridorService } from '../../application/services/corridor/create-corridor.service.js';
import { GetCorridorService } from '../../application/services/corridor/get-corridor.service.js';
import { ListCorridorsService } from '../../application/services/corridor/list-corridors.service.js';
import { UpdateCorridorService } from '../../application/services/corridor/update-corridor.service.js';
import { CorridorRepository } from '../../repositories/interfaces/corridor.repository.js';
import { Corridor } from '../../domain/entities/index.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

suite('Corridor Application Services', () => {
  const mockCorridor: Corridor = {
    id: 'cor-1',
    name: 'Corridor A',
    corridor_type: 'ROAD',
    origin: 'City A',
    destination: 'City B',
    capacity: 1000,
    status: 'ACTIVE',
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockRepo: CorridorRepository = {
    findById: async (id) => id === 'cor-1' ? mockCorridor : null,
    findByName: async (name) => name === 'Corridor A' ? mockCorridor : null,
    create: async (data) => ({ ...mockCorridor, ...data, id: 'new-cor' }),
    update: async (id, data) => id === 'cor-1' ? { ...mockCorridor, ...data } : null,
    list: async (page, pageSize, status) => ({
      data: [mockCorridor],
      meta: { page, page_size: pageSize, total: 1, total_pages: 1 }
    })
  };

  test('CreateCorridorService - successfully creates corridor', async () => {
    const service = new CreateCorridorService(mockRepo);
    const result = await service.execute({
      name: 'New Corridor',
      corridor_type: 'RAIL',
      origin: 'City X',
      destination: 'City Y',
      capacity: 500
    });
    
    assert.strictEqual(result.name, 'New Corridor');
    assert.strictEqual(result.status, 'ACTIVE');
  });

  test('CreateCorridorService - throws on duplicate name', async () => {
    const service = new CreateCorridorService(mockRepo);
    await assert.rejects(
      () => service.execute({
        name: 'Corridor A',
        corridor_type: 'RAIL',
        origin: 'City X',
        destination: 'City Y',
        capacity: 100
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'CORRIDOR_DUPLICATE'
    );
  });

  test('CreateCorridorService - throws on missing name', async () => {
    const service = new CreateCorridorService(mockRepo);
    await assert.rejects(
      () => service.execute({
        name: '',
        corridor_type: 'RAIL',
        origin: 'City X',
        destination: 'City Y',
        capacity: 100
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'CORRIDOR_NAME_REQUIRED'
    );
  });

  test('GetCorridorService - returns corridor if found', async () => {
    const service = new GetCorridorService(mockRepo);
    const result = await service.execute({ id: 'cor-1' });
    assert.ok(result);
    assert.strictEqual(result.id, 'cor-1');
  });

  test('GetCorridorService - returns null if not found', async () => {
    const service = new GetCorridorService(mockRepo);
    const result = await service.execute({ id: 'missing' });
    assert.strictEqual(result, null);
  });

  test('ListCorridorsService - returns paginated result', async () => {
    const service = new ListCorridorsService(mockRepo);
    const result = await service.execute({ page: 1, pageSize: 10 });
    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.meta.total, 1);
  });

  test('UpdateCorridorService - successfully updates corridor', async () => {
    const service = new UpdateCorridorService(mockRepo);
    const result = await service.execute({
      id: 'cor-1',
      name: 'Corridor A Updated'
    });
    
    assert.strictEqual(result.name, 'Corridor A Updated');
  });

  test('UpdateCorridorService - throws on not found', async () => {
    const service = new UpdateCorridorService(mockRepo);
    await assert.rejects(
      () => service.execute({
        id: 'missing',
        name: 'Missing Corridor'
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'CORRIDOR_NOT_FOUND'
    );
  });

  test('UpdateCorridorService - throws on duplicate name during update', async () => {
    const mockRepoDup: CorridorRepository = {
      ...mockRepo,
      findByName: async (name) => name === 'Corridor B' ? { ...mockCorridor, id: 'cor-2' } : null
    };
    const service = new UpdateCorridorService(mockRepoDup);
    
    await assert.rejects(
      () => service.execute({
        id: 'cor-1',
        name: 'Corridor B'
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'CORRIDOR_DUPLICATE'
    );
  });
});
