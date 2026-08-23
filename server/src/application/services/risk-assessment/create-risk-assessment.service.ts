import { RiskAssessmentRepository } from '../../../repositories/interfaces/risk-assessment.repository.js';
import { EventRepository } from '../../../repositories/interfaces/event.repository.js';
import { EvidenceRepository } from '../../../repositories/interfaces/evidence.repository.js';
import { EventAggregate } from '../../../domain/aggregates/event.aggregate.js';
import { RiskAssessment } from '../../../domain/entities/index.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';
import { TransactionManager } from '../../interfaces/transaction-manager.interface.js';

export interface CreateRiskAssessmentInput {
  event_id: string;
  probability: number;
  severity: number;
  exposure: number;
  confidence: number;
  risk_level: string;
  assessment_basis: string;
  created_by: string;
}

export class CreateRiskAssessmentService {
  constructor(
    private riskAssessmentRepository: RiskAssessmentRepository,
    private eventRepository: EventRepository,
    private evidenceRepository: EvidenceRepository,
    private transactionManager: TransactionManager
  ) {}

  async execute(input: CreateRiskAssessmentInput): Promise<RiskAssessment> {
    return this.transactionManager.execute(async () => {
      const event = await this.eventRepository.findById(input.event_id);
      if (!event) {
        throw new BusinessRuleError('EVENT_NOT_FOUND', 'Event not found');
      }

      const evidencePage = await this.evidenceRepository.listByEventId(input.event_id, 1, 100);
      
      const aggregate = EventAggregate.restore(event, evidencePage.data);
      aggregate.markAssessed();

      let version = 1;
      const existing = await this.riskAssessmentRepository.findByEventId(input.event_id);
      if (existing) {
        version = existing.assessment_version + 1;
      }

      const entity: Omit<RiskAssessment, 'id' | 'created_at' | 'updated_at'> = {
        event_id: input.event_id,
        assessment_version: version,
        probability: input.probability,
        severity: input.severity,
        exposure: input.exposure,
        confidence: input.confidence,
        risk_level: input.risk_level,
        assessment_basis: input.assessment_basis,
        created_by: input.created_by
      };

      const assessment = await this.riskAssessmentRepository.create(entity);
      await this.eventRepository.update(input.event_id, { status: aggregate.status });

      return assessment;
    });
  }

  async getRiskAssessment(eventId: string): Promise<RiskAssessment | null> {
    return this.riskAssessmentRepository.findByEventId(eventId);
  }
}
