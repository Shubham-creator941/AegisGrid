import { ScenarioRepository } from '../../../repositories/interfaces/scenario.repository.js';
import { Scenario } from '../../../domain/entities/index.js';

export interface GetScenarioInput {
  id: string;
}

export class GetScenarioService {
  constructor(private scenarioRepository: ScenarioRepository) {}

  async execute(input: GetScenarioInput): Promise<Scenario | null> {
    return this.scenarioRepository.findById(input.id);
  }
}
