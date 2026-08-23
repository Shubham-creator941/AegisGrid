import { ResponseScoreRepository } from '../interfaces/response-score.repository.js';
import { ResponseScore } from '../../domain/entities/index.js';
import { DatabaseClient } from '../../infrastructure/database/client.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';
import { randomUUID } from 'crypto';

export class PostgresResponseScoreRepository implements ResponseScoreRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: string): Promise<ResponseScore | null> {
    const result = await this.db.query<ResponseScore>(
      'SELECT * FROM response_scores WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(entity: Omit<ResponseScore, 'id' | 'created_at' | 'updated_at'>): Promise<ResponseScore> {
    const id = randomUUID();
    const keys = Object.keys(entity);
    const values = Object.values(entity);
    
    const columns = ['id', ...keys];
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    
    const insertValues = [id, ...values];
    
    const query = `
      INSERT INTO response_scores (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.db.query<ResponseScore>(query, insertValues);
    return result.rows[0];
  }

  async update(id: string, entity: Partial<ResponseScore>): Promise<ResponseScore | null> {
    const keys = Object.keys(entity);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = Object.values(entity);
    const now = new Date();
    
    // updated_at does not exist on this table
    // setClauses.push(`updated_at = $${keys.length + 2}`);
    // values.push(now);
    
    const query = `
      UPDATE response_scores
      SET ${setClauses.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.db.query<ResponseScore>(query, [id, ...values]);
    return result.rows[0] || null;
  }

  async list(page: number, pageSize: number): Promise<PaginatedResult<ResponseScore>> {
    const offset = (page - 1) * pageSize;
    const [dataResult, countResult] = await Promise.all([
      this.db.query<ResponseScore>(
        'SELECT * FROM response_scores ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [pageSize, offset]
      ),
      this.db.query<{count: string}>('SELECT COUNT(*) FROM response_scores')
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

  async listByCandidateId(candidateId: string): Promise<ResponseScore[]> {
    const result = await this.db.query<ResponseScore>(
      'SELECT * FROM response_scores WHERE response_candidate_id = $1 ORDER BY calculated_at ASC',
      [candidateId]
    );
    return result.rows;
  }
}
