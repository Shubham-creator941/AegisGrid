import { SupplyFlow } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface SupplyFlowRepository {
  findById(id: string): Promise<SupplyFlow | null>;
  create(entity: Omit<SupplyFlow, 'id' | 'created_at' | 'updated_at'>): Promise<SupplyFlow>;
  update(id: string, entity: Partial<SupplyFlow>): Promise<SupplyFlow | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<SupplyFlow>>;
}
