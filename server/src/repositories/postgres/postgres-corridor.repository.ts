import { CorridorRepository } from '../interfaces/corridor.repository.js';
import { Corridor } from '../../domain/entities/index.js';
import { DatabaseClient } from '../../infrastructure/database/client.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';
import { randomUUID } from 'crypto';

export class PostgresCorridorRepository implements CorridorRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: string): Promise<Corridor | null> {
    const result = await this.db.query<Corridor>(
      'SELECT * FROM corridors WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async findByName(name: string): Promise<Corridor | null> {
    const result = await this.db.query<Corridor>(
      'SELECT * FROM corridors WHERE name = $1',
      [name]
    );
    return result.rows[0] || null;
  }

  async create(entity: Omit<Corridor, 'id' | 'created_at' | 'updated_at'>): Promise<Corridor> {
    const id = randomUUID();
    const keys = Object.keys(entity);
    const values = Object.values(entity);
    
    const columns = ['id', ...keys, 'created_at', 'updated_at'];
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    const now = new Date();
    
    const insertValues = [id, ...values, now, now];
    
    const query = `
      INSERT INTO corridors (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.db.query<Corridor>(query, insertValues);
    return result.rows[0];
  }

  async update(id: string, entity: Partial<Corridor>): Promise<Corridor | null> {
    const keys = Object.keys(entity);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = Object.values(entity);
    const now = new Date();
    
    setClauses.push(`updated_at = $${keys.length + 2}`);
    values.push(now);
    
    const query = `
      UPDATE corridors
      SET ${setClauses.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.db.query<Corridor>(query, [id, ...values]);
    return result.rows[0] || null;
  }

  async list(page: number, pageSize: number, status?: string): Promise<PaginatedResult<Corridor>> {
    const offset = (page - 1) * pageSize;
    
    let dataQuery = 'SELECT * FROM corridors';
    let countQuery = 'SELECT COUNT(*) FROM corridors';
    const params: any[] = [];
    
    if (status) {
      dataQuery += ' WHERE status = $1';
      countQuery += ' WHERE status = $1';
      params.push(status);
    }
    
    dataQuery += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const [dataResult, countResult] = await Promise.all([
      this.db.query<Corridor>(dataQuery, [...params, pageSize, offset]),
      this.db.query<{count: string}>(countQuery, params)
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
