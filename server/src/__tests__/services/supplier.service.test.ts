import test, { suite } from 'node:test';
import assert from 'node:assert';
import { CreateSupplierService } from '../../application/services/supplier/create-supplier.service.js';
import { GetSupplierService } from '../../application/services/supplier/get-supplier.service.js';
import { ListSuppliersService } from '../../application/services/supplier/list-suppliers.service.js';
import { UpdateSupplierService } from '../../application/services/supplier/update-supplier.service.js';
import { SupplierRepository } from '../../repositories/interfaces/supplier.repository.js';
import { Supplier } from '../../domain/entities/index.js';
import { SupplierType } from '../../domain/enums/index.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

suite('Supplier Application Services', () => {
  const mockSupplier: Supplier = {
    id: 'sup-1',
    name: 'Supplier A',
    country: 'Country X',
    supplier_type: SupplierType.STATE,
    status: 'ACTIVE',
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockRepo: SupplierRepository = {
    findById: async (id) => id === 'sup-1' ? mockSupplier : null,
    findByName: async (name) => name === 'Supplier A' ? mockSupplier : null,
    create: async (data) => ({ ...mockSupplier, ...data, id: 'new-sup' }),
    update: async (id, data) => id === 'sup-1' ? { ...mockSupplier, ...data } : null,
    list: async (page, pageSize, status) => ({
      data: [mockSupplier],
      meta: { page, page_size: pageSize, total: 1, total_pages: 1 }
    })
  };

  test('CreateSupplierService - successfully creates supplier', async () => {
    const service = new CreateSupplierService(mockRepo);
    const result = await service.execute({
      name: 'New Supplier',
      country: 'Country Y',
      supplier_type: SupplierType.PRIVATE
    });
    
    assert.strictEqual(result.name, 'New Supplier');
    assert.strictEqual(result.status, 'ACTIVE');
  });

  test('CreateSupplierService - throws on duplicate name', async () => {
    const service = new CreateSupplierService(mockRepo);
    await assert.rejects(
      () => service.execute({
        name: 'Supplier A',
        country: 'Country Y',
        supplier_type: SupplierType.PRIVATE
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'SUPPLIER_DUPLICATE'
    );
  });

  test('CreateSupplierService - throws on missing name', async () => {
    const service = new CreateSupplierService(mockRepo);
    await assert.rejects(
      () => service.execute({
        name: '',
        country: 'Country Y',
        supplier_type: SupplierType.PRIVATE
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'SUPPLIER_NAME_REQUIRED'
    );
  });

  test('GetSupplierService - returns supplier if found', async () => {
    const service = new GetSupplierService(mockRepo);
    const result = await service.execute({ id: 'sup-1' });
    assert.ok(result);
    assert.strictEqual(result.id, 'sup-1');
  });

  test('GetSupplierService - returns null if not found', async () => {
    const service = new GetSupplierService(mockRepo);
    const result = await service.execute({ id: 'missing' });
    assert.strictEqual(result, null);
  });

  test('ListSuppliersService - returns paginated result', async () => {
    const service = new ListSuppliersService(mockRepo);
    const result = await service.execute({ page: 1, pageSize: 10 });
    assert.strictEqual(result.data.length, 1);
    assert.strictEqual(result.meta.total, 1);
  });

  test('UpdateSupplierService - successfully updates supplier', async () => {
    const service = new UpdateSupplierService(mockRepo);
    const result = await service.execute({
      id: 'sup-1',
      name: 'Supplier A Updated'
    });
    
    assert.strictEqual(result.name, 'Supplier A Updated');
  });

  test('UpdateSupplierService - throws on not found', async () => {
    const service = new UpdateSupplierService(mockRepo);
    await assert.rejects(
      () => service.execute({
        id: 'missing',
        name: 'Missing Supplier'
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'SUPPLIER_NOT_FOUND'
    );
  });

  test('UpdateSupplierService - throws on duplicate name during update', async () => {
    const mockRepoDup: SupplierRepository = {
      ...mockRepo,
      findByName: async (name) => name === 'Supplier B' ? { ...mockSupplier, id: 'sup-2' } : null
    };
    const service = new UpdateSupplierService(mockRepoDup);
    
    await assert.rejects(
      () => service.execute({
        id: 'sup-1',
        name: 'Supplier B'
      }),
      (err: any) => err instanceof BusinessRuleError && err.code === 'SUPPLIER_DUPLICATE'
    );
  });
});
