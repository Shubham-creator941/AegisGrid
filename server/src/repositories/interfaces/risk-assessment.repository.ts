import { RiskAssessment } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface RiskAssessmentRepository {
  findById(id: string): Promise<RiskAssessment | null>;
  create(entity: Omit<RiskAssessment, 'id' | 'created_at' | 'updated_at'>): Promise<RiskAssessment>;
  update(id: string, entity: Partial<RiskAssessment>): Promise<RiskAssessment | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<RiskAssessment>>;
}
