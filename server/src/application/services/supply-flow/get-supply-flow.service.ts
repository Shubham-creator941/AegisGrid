import { SupplyFlowRepository } from '../../../repositories/interfaces/supply-flow.repository.js';
import { SupplyFlow } from '../../../domain/entities/index.js';

export interface GetSupplyFlowInput {
  id: string;
}

export class GetSupplyFlowService {
  constructor(private supplyFlowRepository: SupplyFlowRepository) {}

  async execute(input: GetSupplyFlowInput): Promise<SupplyFlow | null> {
    return this.supplyFlowRepository.findById(input.id);
  }
}
