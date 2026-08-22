import { ScenarioRepository } from '../../../repositories/interfaces/scenario.repository.js';
import { Scenario } from '../../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ListScenariosInput {
  page: number;
  pageSize: number;
}

export class ListScenariosService {
  constructor(private scenarioRepository: ScenarioRepository) {}

  async execute(input: ListScenariosInput): Promise<PaginatedResult<Scenario>> {
    return this.scenarioRepository.list(input.page, input.pageSize);
  }
}
