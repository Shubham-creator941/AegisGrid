import { Evaluation } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface EvaluationRepository {
  findById(id: string): Promise<Evaluation | null>;
  create(entity: Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>): Promise<Evaluation>;
  update(id: string, entity: Partial<Evaluation>): Promise<Evaluation | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<Evaluation>>;
}
