import { ImpactAssessmentRepository } from '../interfaces/impact-assessment.repository.js';
import { ImpactAssessment } from '../../domain/entities/index.js';
import { DatabaseClient } from '../../infrastructure/database/client.js';
import { randomUUID } from 'crypto';

export class PostgresImpactAssessmentRepository implements ImpactAssessmentRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: string): Promise<ImpactAssessment | null> {
    const result = await this.db.query<ImpactAssessment>(
      'SELECT * FROM impact_assessments WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByEvaluationId(evaluationId: string): Promise<ImpactAssessment | null> {
    const result = await this.db.query<ImpactAssessment>(
      'SELECT * FROM impact_assessments WHERE evaluation_id = $1 ORDER BY created_at DESC LIMIT 1',
      [evaluationId]
    );
    return result.rows[0] || null;
  }

  async create(entity: Omit<ImpactAssessment, 'id' | 'created_at'>): Promise<ImpactAssessment> {
    const id = randomUUID();
    const keys = Object.keys(entity);
    const values = Object.values(entity);
    
    const columns = ['id', ...keys, 'created_at'];
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    const now = new Date();
    
    const insertValues = [id, ...values, now];
    
    const query = `
      INSERT INTO impact_assessments (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.db.query<ImpactAssessment>(query, insertValues);
    return result.rows[0];
  }
}
