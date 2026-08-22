import { Supplier } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface SupplierRepository {
  findById(id: string): Promise<Supplier | null>;
  findByName(name: string): Promise<Supplier | null>;
  create(entity: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier>;
  update(id: string, entity: Partial<Supplier>): Promise<Supplier | null>;
  list(page: number, pageSize: number, status?: string): Promise<PaginatedResult<Supplier>>;
}
