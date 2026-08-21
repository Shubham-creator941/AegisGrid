import { EvidenceRepository } from '../../../repositories/interfaces/evidence.repository.js';
import { EventRepository } from '../../../repositories/interfaces/event.repository.js';
import { Evidence } from '../../../domain/entities/index.js';

export interface CreateEvidenceInput {
  event_id: string;
  source_type: string;
  source_name: string;
  source_reference: string;
  content: string;
  published_at: Date;
  retrieved_at: Date;
  confidence: number;
}

export class CreateEvidenceService {
  constructor(
    private evidenceRepo: EvidenceRepository,
    private eventRepo: EventRepository
  ) {}

  async execute(input: CreateEvidenceInput): Promise<Evidence> {
    const event = await this.eventRepo.findById(input.event_id);
    if (!event) {
      throw new Error('Event not found');
    }

    const newEvidence = {
      event_id: input.event_id,
      source_type: input.source_type,
      source_name: input.source_name,
      source_reference: input.source_reference,
      content: input.content,
      published_at: input.published_at,
      retrieved_at: input.retrieved_at,
      confidence: input.confidence
    };

    return await this.evidenceRepo.create(newEvidence as any);
  }
}
