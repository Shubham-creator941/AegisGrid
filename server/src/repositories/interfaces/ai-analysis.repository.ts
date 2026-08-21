import { AIAnalysis } from '../../domain/entities/index.js';

export interface AIAnalysisRepository {
  create(analysis: Omit<AIAnalysis, 'id' | 'created_at'>): Promise<AIAnalysis>;
  findByEventId(eventId: string): Promise<AIAnalysis | null>;
}
