import { Decision } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface DecisionRepository {
  findById(id: string): Promise<Decision | null>;
  create(entity: Omit<Decision, 'id' | 'created_at' | 'updated_at'>): Promise<Decision>;
  update(id: string, entity: Partial<Decision>): Promise<Decision | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<Decision>>;
  findByRecommendationId(recommendationId: string): Promise<Decision | null>;
}
