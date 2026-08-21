import { ScenarioAssumption } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ScenarioAssumptionRepository {
  findById(id: string): Promise<ScenarioAssumption | null>;
  create(entity: Omit<ScenarioAssumption, 'id' | 'created_at' | 'updated_at'>): Promise<ScenarioAssumption>;
  update(id: string, entity: Partial<ScenarioAssumption>): Promise<ScenarioAssumption | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<ScenarioAssumption>>;
}
