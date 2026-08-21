import { EventRepository } from '../../../repositories/interfaces/event.repository.js';
import { Event } from '../../../domain/entities/index.js';

export interface GetEventInput {
  event_id: string;
}

export class GetEventService {
  constructor(private eventRepo: EventRepository) {}

  async execute(input: GetEventInput): Promise<Event | null> {
    return await this.eventRepo.findById(input.event_id);
  }
}
