import { ResponseCandidate } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ResponseCandidateRepository {
  findById(id: string): Promise<ResponseCandidate | null>;
  create(entity: Omit<ResponseCandidate, 'id' | 'created_at' | 'updated_at'>): Promise<ResponseCandidate>;
  update(id: string, entity: Partial<ResponseCandidate>): Promise<ResponseCandidate | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<ResponseCandidate>>;
  listByEvaluationId(evaluationId: string): Promise<ResponseCandidate[]>;
}
