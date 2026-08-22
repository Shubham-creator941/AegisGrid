import { ScenarioAssumptionRepository } from '../interfaces/scenario-assumption.repository.js';
import { ScenarioAssumption } from '../../domain/entities/index.js';
import { DatabaseClient } from '../../infrastructure/database/client.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';
import { randomUUID } from 'crypto';

export class PostgresScenarioAssumptionRepository implements ScenarioAssumptionRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: string): Promise<ScenarioAssumption | null> {
    const result = await this.db.query<ScenarioAssumption>(
      'SELECT * FROM scenario_assumptions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async create(entity: Omit<ScenarioAssumption, 'id' | 'created_at' | 'updated_at'>): Promise<ScenarioAssumption> {
    const id = randomUUID();
    const keys = Object.keys(entity);
    const values = Object.values(entity);
    
    const columns = ['id', ...keys, 'created_at', 'updated_at'];
    const placeholders = columns.map((_, i) => `$${i + 1}`);
    const now = new Date();
    
    const insertValues = [id, ...values, now, now];
    
    const query = `
      INSERT INTO scenario_assumptions (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.db.query<ScenarioAssumption>(query, insertValues);
    return result.rows[0];
  }

  async update(id: string, entity: Partial<ScenarioAssumption>): Promise<ScenarioAssumption | null> {
    const keys = Object.keys(entity);
    if (keys.length === 0) return this.findById(id);

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`);
    const values = Object.values(entity);
    const now = new Date();
    
    setClauses.push(`updated_at = $${keys.length + 2}`);
    values.push(now);
    
    const query = `
      UPDATE scenario_assumptions
      SET ${setClauses.join(', ')}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await this.db.query<ScenarioAssumption>(query, [id, ...values]);
    return result.rows[0] || null;
  }

  async list(page: number, pageSize: number): Promise<PaginatedResult<ScenarioAssumption>> {
    const offset = (page - 1) * pageSize;
    const [dataResult, countResult] = await Promise.all([
      this.db.query<ScenarioAssumption>(
        'SELECT * FROM scenario_assumptions ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [pageSize, offset]
      ),
      this.db.query<{count: string}>('SELECT COUNT(*) FROM scenario_assumptions')
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

  async listByScenarioId(scenarioId: string): Promise<ScenarioAssumption[]> {
    const result = await this.db.query<ScenarioAssumption>(
      'SELECT * FROM scenario_assumptions WHERE scenario_id = $1 ORDER BY created_at ASC',
      [scenarioId]
    );
    return result.rows;
  }
}
