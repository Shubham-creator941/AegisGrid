import { Facility } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface FacilityRepository {
  findById(id: string): Promise<Facility | null>;
  findByName(name: string): Promise<Facility | null>;
  create(entity: Omit<Facility, 'id' | 'created_at' | 'updated_at'>): Promise<Facility>;
  update(id: string, entity: Partial<Facility>): Promise<Facility | null>;
  list(page: number, pageSize: number, status?: string): Promise<PaginatedResult<Facility>>;
}
