import { EvidenceRepository } from '../../../repositories/interfaces/evidence.repository.js';
import { EventRepository } from '../../../repositories/interfaces/event.repository.js';
import { Evidence } from '../../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ListEvidenceInput {
  event_id: string;
  page: number;
  pageSize: number;
}

export class ListEvidenceService {
  constructor(
    private evidenceRepo: EvidenceRepository,
    private eventRepo: EventRepository
  ) {}

  async execute(input: ListEvidenceInput): Promise<PaginatedResult<Evidence>> {
    const event = await this.eventRepo.findById(input.event_id);
    if (!event) {
      throw new Error('Event not found');
    }

    return await this.evidenceRepo.listByEventId(input.event_id, input.page, input.pageSize);
  }
}
