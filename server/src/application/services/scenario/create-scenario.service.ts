import { ScenarioRepository } from '../../../repositories/interfaces/scenario.repository.js';
import { EventRepository } from '../../../repositories/interfaces/event.repository.js';
import { Scenario } from '../../../domain/entities/index.js';
import { ScenarioAggregate } from '../../../domain/aggregates/scenario.aggregate.js';

export interface CreateScenarioInput {
  name: string;
  description: string;
  event_id: string;
  created_by: string;
}

export class CreateScenarioService {
  constructor(
    private scenarioRepo: ScenarioRepository,
    private eventRepo: EventRepository
  ) {}

  async execute(input: CreateScenarioInput): Promise<Scenario> {
    const event = await this.eventRepo.findById(input.event_id);
    if (!event) {
      throw new Error('Event not found');
    }

    const newScenario = {
      name: input.name,
      description: input.description,
      event_id: input.event_id,
      status: 'DRAFT' as any,
      created_by: input.created_by
    };
    return await this.scenarioRepo.create(newScenario as any);
  }
}
