import { UserRepository } from '../interfaces/user.repository.js';
import { User } from '../../domain/entities/index.js';
import { DatabaseClient } from '../../infrastructure/database/client.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';
import { randomUUID } from 'crypto';

export class PostgresUserRepository implements UserRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(entity: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const id = randomUUID();
    const keys = Object.keys(entity);
    const values = Object.values(entity);
    
    const columns = ['id', ...keys, 'created_at', 'updated_at'];
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    const now = new Date();
    
    const insertValues = [id, ...values, now, now];
    
    const query = `
      INSERT INTO users (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.db.query<User>(query, insertValues);
    return result.rows[0];
  }

  async update(id: string, entity: Partial<User>): Promise<User | null> {
    const keys = Object.keys(entity);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = Object.values(entity);
    const now = new Date();
    
    setClauses.push(`updated_at = $${keys.length + 2}`);
    values.push(now);
    
    const query = `
      UPDATE users
      SET ${setClauses.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.db.query<User>(query, [id, ...values]);
    return result.rows[0] || null;
  }

  async list(page: number, pageSize: number): Promise<PaginatedResult<User>> {
    const offset = (page - 1) * pageSize;
    const [dataResult, countResult] = await Promise.all([
      this.db.query<User>(
        'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [pageSize, offset]
      ),
      this.db.query<{count: string}>('SELECT COUNT(*) FROM users')
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

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }
}
