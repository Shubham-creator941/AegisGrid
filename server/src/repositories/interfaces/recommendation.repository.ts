import { Recommendation } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface RecommendationRepository {
  findById(id: string): Promise<Recommendation | null>;
  create(entity: Omit<Recommendation, 'id' | 'created_at' | 'updated_at'>): Promise<Recommendation>;
  update(id: string, entity: Partial<Recommendation>): Promise<Recommendation | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<Recommendation>>;
  findByEvaluationId(evaluationId: string): Promise<Recommendation | null>;
}
