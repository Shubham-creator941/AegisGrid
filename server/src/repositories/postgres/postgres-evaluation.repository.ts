import { EvaluationRepository } from '../interfaces/evaluation.repository.js';
import { Evaluation } from '../../domain/entities/index.js';
import { DatabaseClient } from '../../infrastructure/database/client.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';
import { randomUUID } from 'crypto';

export class PostgresEvaluationRepository implements EvaluationRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: string): Promise<Evaluation | null> {
    const result = await this.db.query<Evaluation>(
      'SELECT * FROM scenario_evaluations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(entity: Omit<Evaluation, 'id' | 'created_at' | 'updated_at'>): Promise<Evaluation> {
    const id = randomUUID();
    const keys = Object.keys(entity);
    const values = Object.values(entity);
    
    const columns = ['id', ...keys, 'created_at'];
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    const now = new Date();
    
    const insertValues = [id, ...values, now];
    
    const query = `
      INSERT INTO scenario_evaluations (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.db.query<Evaluation>(query, insertValues);
    return result.rows[0];
  }

  async update(id: string, entity: Partial<Evaluation>): Promise<Evaluation | null> {
    const keys = Object.keys(entity);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = Object.values(entity);
    const now = new Date();
    
    // updated_at does not exist on this table
    // setClauses.push(`updated_at = $${keys.length + 2}`);
    // values.push(now);
    
    const query = `
      UPDATE scenario_evaluations
      SET ${setClauses.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.db.query<Evaluation>(query, [id, ...values]);
    return result.rows[0] || null;
  }

  async list(page: number, pageSize: number): Promise<PaginatedResult<Evaluation>> {
    const offset = (page - 1) * pageSize;
    const [dataResult, countResult] = await Promise.all([
      this.db.query<Evaluation>(
        'SELECT * FROM scenario_evaluations ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [pageSize, offset]
      ),
      this.db.query<{count: string}>('SELECT COUNT(*) FROM scenario_evaluations')
    ]);
    
    const total = parseInt(countResult.rows[0].count, 10);
    return {
      data: dataResult.rows,
      meta: {
        page,
        page_size: pageSize,
        total,
        total_pages: Math.ceil(total / pageSize)
      }
    };
  }
}
