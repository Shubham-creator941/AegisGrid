import { Corridor } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface CorridorRepository {
  findById(id: string): Promise<Corridor | null>;
  create(entity: Omit<Corridor, 'id' | 'created_at' | 'updated_at'>): Promise<Corridor>;
  update(id: string, entity: Partial<Corridor>): Promise<Corridor | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<Corridor>>;
}
