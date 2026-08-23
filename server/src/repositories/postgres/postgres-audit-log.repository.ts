import { AuditLogRepository, AuditLogFilter } from '../interfaces/audit-log.repository.js';
import { AuditLog } from '../../domain/entities/index.js';
import { DatabaseClient } from '../../infrastructure/database/client.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';
import { randomUUID } from 'crypto';

export class PostgresAuditLogRepository implements AuditLogRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: string): Promise<AuditLog | null> {
    const result = await this.db.query<AuditLog>(
      'SELECT * FROM audit_logs WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(entity: Omit<AuditLog, 'id' | 'created_at' | 'updated_at'>): Promise<AuditLog> {
    const id = randomUUID();
    const keys = Object.keys(entity);
    const values = Object.values(entity).map((val, i) => {
      const key = keys[i];
      if (['before_state', 'after_state', 'metadata'].includes(key)) {
        return val !== undefined && val !== null ? JSON.stringify(val) : null;
      }
      return val;
    });
    
    const columns = ['id', ...keys, 'created_at'];
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    const now = new Date();
    
    const insertValues = [id, ...values, now];
    
    const query = `
      INSERT INTO audit_logs (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    console.log("INSERTING AUDIT LOG:", insertValues, query);
    const result = await this.db.query<AuditLog>(query, insertValues);
    return result.rows[0];
  }

  async update(id: string, entity: Partial<AuditLog>): Promise<AuditLog | null> {
    const keys = Object.keys(entity);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = Object.values(entity).map((val, i) => {
      const key = keys[i];
      if (['before_state', 'after_state', 'metadata'].includes(key)) {
        return val !== undefined && val !== null ? JSON.stringify(val) : null;
      }
      return val;
    });
    const now = new Date();
    
    // updated_at does not exist on this table
    // setClauses.push(`updated_at = $${keys.length + 2}`);
    // values.push(now);
    
    const query = `
      UPDATE audit_logs
      SET ${setClauses.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.db.query<AuditLog>(query, [id, ...values]);
    return result.rows[0] || null;
  }

  async list(page: number, pageSize: number, filters?: AuditLogFilter): Promise<PaginatedResult<AuditLog>> {
    const offset = (page - 1) * pageSize;
    
    let whereClauses: string[] = [];
    let values: any[] = [];
    let queryIndex = 1;

    if (filters) {
      if (filters.actor_id) {
        whereClauses.push(`actor_id = $${queryIndex++}`);
        values.push(filters.actor_id);
      }
      if (filters.action) {
        whereClauses.push(`action = $${queryIndex++}`);
        values.push(filters.action);
      }
      if (filters.entity_type) {
        whereClauses.push(`entity_type = $${queryIndex++}`);
        values.push(filters.entity_type);
      }
      if (filters.entity_id) {
        whereClauses.push(`entity_id = $${queryIndex++}`);
        values.push(filters.entity_id);
      }
    }

    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    
    const [dataResult, countResult] = await Promise.all([
      this.db.query<AuditLog>(
        `SELECT * FROM audit_logs ${whereString} ORDER BY created_at DESC LIMIT $${queryIndex} OFFSET $${queryIndex + 1}`,
        [...values, pageSize, offset]
      ),
      this.db.query<{count: string}>(`SELECT COUNT(*) FROM audit_logs ${whereString}`, values)
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
