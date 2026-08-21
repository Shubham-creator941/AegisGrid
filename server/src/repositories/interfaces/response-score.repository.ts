import { ResponseScore } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ResponseScoreRepository {
  findById(id: string): Promise<ResponseScore | null>;
  create(entity: Omit<ResponseScore, 'id' | 'created_at' | 'updated_at'>): Promise<ResponseScore>;
  update(id: string, entity: Partial<ResponseScore>): Promise<ResponseScore | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<ResponseScore>>;
}
