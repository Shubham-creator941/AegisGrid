import { Evidence } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface EvidenceRepository {
  findById(id: string): Promise<Evidence | null>;
  create(entity: Omit<Evidence, 'id' | 'created_at' | 'updated_at'>): Promise<Evidence>;
  update(id: string, entity: Partial<Evidence>): Promise<Evidence | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<Evidence>>;
}
