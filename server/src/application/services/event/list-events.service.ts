import { EventRepository } from '../../../repositories/interfaces/event.repository.js';
import { Event } from '../../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ListEventsInput {
  page: number;
  pageSize: number;
}

export class ListEventsService {
  constructor(private eventRepo: EventRepository) {}

  async execute(input: ListEventsInput): Promise<PaginatedResult<Event>> {
    return await this.eventRepo.list(input.page, input.pageSize);
  }
}
