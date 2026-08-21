import { ConstraintEvaluation } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ConstraintEvaluationRepository {
  findById(id: string): Promise<ConstraintEvaluation | null>;
  create(entity: Omit<ConstraintEvaluation, 'id' | 'created_at' | 'updated_at'>): Promise<ConstraintEvaluation>;
  update(id: string, entity: Partial<ConstraintEvaluation>): Promise<ConstraintEvaluation | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<ConstraintEvaluation>>;
}
