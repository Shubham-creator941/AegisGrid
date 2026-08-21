import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresSupplierRepository } from '../../repositories/postgres/postgres-supplier.repository.js';
import { DatabaseClient, QueryResult } from '../../infrastructure/database/client.js';

test('PostgresSupplierRepository', async (t) => {
  await t.test('findById returns supplier when found', async () => {
    const mockDb: DatabaseClient = {
      query: async <T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> => {
        return {
          rows: [{ id: params![0], name: 'Supplier A', country: 'US', supplier_type: 'PRIVATE', status: 'ACTIVE', created_at: new Date(), updated_at: new Date() } as unknown as T],
          rowCount: 1,
        };
      }
    };
    const repo = new PostgresSupplierRepository(mockDb);
    const supplier = await repo.findById('123');
    assert.ok(supplier);
    assert.equal(supplier.id, '123');
    assert.equal(supplier.name, 'Supplier A');
  });

  await t.test('findById returns null when not found', async () => {
    const mockDb: DatabaseClient = {
      query: async <T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> => {
        return {
          rows: [],
          rowCount: 0,
        };
      }
    };
    const repo = new PostgresSupplierRepository(mockDb);
    const supplier = await repo.findById('123');
    assert.equal(supplier, null);
  });
  
  await t.test('create generates UUID and returns entity', async () => {
    const mockDb: DatabaseClient = {
      query: async <T>(sql: string, params?: unknown[]): Promise<QueryResult<T>> => {
        // Mock returning exactly what was inserted
        return {
          rows: [{ 
            id: params![0], 
            name: params![1], 
            country: params![2], 
            supplier_type: params![3], 
            status: params![4],
            created_at: params![5], 
            updated_at: params![6] 
          } as unknown as T],
          rowCount: 1,
        };
      }
    };
    const repo = new PostgresSupplierRepository(mockDb);
    const newSupplier = await repo.create({
      name: 'Supplier B',
      country: 'CA',
      supplier_type: 'STATE',
      status: 'ACTIVE'
    } as any);
    
    assert.ok(newSupplier.id);
    assert.equal(newSupplier.name, 'Supplier B');
  });
});
