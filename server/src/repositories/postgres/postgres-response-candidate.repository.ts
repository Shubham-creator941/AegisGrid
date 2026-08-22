import { ResponseCandidateRepository } from '../interfaces/response-candidate.repository.js';
import { ResponseCandidate } from '../../domain/entities/index.js';
import { DatabaseClient } from '../../infrastructure/database/client.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';
import { randomUUID } from 'crypto';

export class PostgresResponseCandidateRepository implements ResponseCandidateRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: string): Promise<ResponseCandidate | null> {
    const result = await this.db.query<ResponseCandidate>(
      'SELECT * FROM response_candidates WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(entity: Omit<ResponseCandidate, 'id' | 'created_at' | 'updated_at'>): Promise<ResponseCandidate> {
    const id = randomUUID();
    const keys = Object.keys(entity);
    const values = Object.values(entity);
    
    const columns = ['id', ...keys, 'created_at', 'updated_at'];
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    const now = new Date();
    
    const insertValues = [id, ...values, now, now];
    
    const query = `
      INSERT INTO response_candidates (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.db.query<ResponseCandidate>(query, insertValues);
    return result.rows[0];
  }

  async update(id: string, entity: Partial<ResponseCandidate>): Promise<ResponseCandidate | null> {
    const keys = Object.keys(entity);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = Object.values(entity);
    const now = new Date();
    
    setClauses.push(`updated_at = $${keys.length + 2}`);
    values.push(now);
    
    const query = `
      UPDATE response_candidates
      SET ${setClauses.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.db.query<ResponseCandidate>(query, [id, ...values]);
    return result.rows[0] || null;
  }

  async list(page: number, pageSize: number): Promise<PaginatedResult<ResponseCandidate>> {
    const offset = (page - 1) * pageSize;
    const [dataResult, countResult] = await Promise.all([
      this.db.query<ResponseCandidate>(
        'SELECT * FROM response_candidates ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [pageSize, offset]
      ),
      this.db.query<{count: string}>('SELECT COUNT(*) FROM response_candidates')
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

  async listByEvaluationId(evaluationId: string): Promise<ResponseCandidate[]> {
    const result = await this.db.query<ResponseCandidate>(
      'SELECT * FROM response_candidates WHERE evaluation_id = $1 ORDER BY created_at ASC',
      [evaluationId]
    );
    return result.rows;
  }
}
