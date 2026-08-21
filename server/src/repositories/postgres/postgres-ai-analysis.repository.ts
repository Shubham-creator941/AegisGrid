import { AIAnalysisRepository } from '../interfaces/ai-analysis.repository.js';
import { AIAnalysis } from '../../domain/entities/index.js';
import { DatabaseClient } from '../../infrastructure/database/client.js';
import { randomUUID } from 'crypto';

export class PostgresAIAnalysisRepository implements AIAnalysisRepository {
  constructor(private db: DatabaseClient) {}

  async create(entity: Omit<AIAnalysis, 'id' | 'created_at'>): Promise<AIAnalysis> {
    const id = randomUUID();
    const now = new Date();
    
    // We explicitly extract the keys to ensure we map correctly, handling structured_output (JSONB).
    const query = `
      INSERT INTO ai_analysis (id, event_id, model_name, model_version, analysis_version, structured_output, confidence, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      id,
      entity.event_id,
      entity.model_name,
      entity.model_version,
      entity.analysis_version,
      JSON.stringify(entity.structured_output),
      entity.confidence,
      now
    ];
    
    const result = await this.db.query<AIAnalysis>(query, values);
    return result.rows[0];
  }

  async findByEventId(eventId: string): Promise<AIAnalysis | null> {
    const query = `
      SELECT * FROM ai_analysis 
      WHERE event_id = $1 
      ORDER BY analysis_version DESC, created_at DESC 
      LIMIT 1
    `;
    const result = await this.db.query<AIAnalysis>(query, [eventId]);
    return result.rows[0] || null;
  }
}
