import { SupplyFlowRepository } from '../../../repositories/interfaces/supply-flow.repository.js';
import { SupplyFlow } from '../../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ListSupplyFlowsInput {
  page: number;
  pageSize: number;
}

export class ListSupplyFlowsService {
  constructor(private supplyFlowRepository: SupplyFlowRepository) {}

  async execute(input: ListSupplyFlowsInput): Promise<PaginatedResult<SupplyFlow>> {
    return this.supplyFlowRepository.list(input.page, input.pageSize);
  }
}
