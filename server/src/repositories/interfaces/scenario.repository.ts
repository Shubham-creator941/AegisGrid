import { Scenario } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ScenarioRepository {
  findById(id: string): Promise<Scenario | null>;
  create(entity: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>): Promise<Scenario>;
  update(id: string, entity: Partial<Scenario>): Promise<Scenario | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<Scenario>>;
}
