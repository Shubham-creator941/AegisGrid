import { ImpactAssessment } from '../../domain/entities/index.js';

export interface ImpactAssessmentRepository {
  findById(id: string): Promise<ImpactAssessment | null>;
  findByEvaluationId(evaluationId: string): Promise<ImpactAssessment | null>;
  create(entity: Omit<ImpactAssessment, 'id' | 'created_at'>): Promise<ImpactAssessment>;
}
