import { EventRepository } from '../../../repositories/interfaces/event.repository.js';
import { Event } from '../../../domain/entities/index.js';
import { EventAggregate } from '../../../domain/aggregates/event.aggregate.js';

export interface CreateEventInput {
  title: string;
  description: string;
  event_type: string;
  severity: string;
  affected_region: string;
}

export class CreateEventService {
  constructor(private eventRepo: EventRepository) {}

  async execute(input: CreateEventInput): Promise<Event> {
    const newEvent = {
      title: input.title,
      description: input.description,
      event_type: input.event_type as any,
      severity: input.severity as any,
      status: 'OPEN' as any,
      affected_region: input.affected_region
    };
    return await this.eventRepo.create(newEvent as any);
  }
}
