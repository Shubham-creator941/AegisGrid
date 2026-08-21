import { EventRepository } from '../../../repositories/interfaces/event.repository.js';
import { EvidenceRepository } from '../../../repositories/interfaces/evidence.repository.js';
import { AIAnalysisRepository } from '../../../repositories/interfaces/ai-analysis.repository.js';
import { AIAnalysisService } from '../../interfaces/ai-analysis.service.js';
import { AIResponseValidator } from '../../validators/ai-response.validator.js';
import { TransactionManager } from '../../interfaces/transaction-manager.interface.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';
import { AIAnalysis } from '../../../domain/entities/index.js';

export class EventAnalysisService {
  constructor(
    private eventRepository: EventRepository,
    private evidenceRepository: EvidenceRepository,
    private aiAnalysisRepository: AIAnalysisRepository,
    private aiAdapter: AIAnalysisService,
    private transactionManager: TransactionManager
  ) {}

  async analyzeEvent(eventId: string): Promise<AIAnalysis> {
    return this.transactionManager.execute(async () => {
      const event = await this.eventRepository.findById(eventId);
      if (!event) {
        throw new BusinessRuleError('EVENT_NOT_FOUND', `Event with ID ${eventId} not found`);
      }

      const evidencePage = await this.evidenceRepository.listByEventId(eventId, 1, 100);
      const evidence = evidencePage.data;

      let aiResponse;
      try {
        aiResponse = await this.aiAdapter.analyze({ event, evidence });
      } catch (err: any) {
        throw new BusinessRuleError('AI_PROVIDER_ERROR', 'The AI provider failed to analyze the event');
      }

      AIResponseValidator.validate(aiResponse);

      const newAnalysis = {
        event_id: eventId,
        model_name: aiResponse.model_name,
        model_version: aiResponse.model_version,
        analysis_version: 1,
        structured_output: aiResponse.structured_output,
        confidence: aiResponse.confidence
      };

      const prevAnalysis = await this.aiAnalysisRepository.findByEventId(eventId);
      if (prevAnalysis) {
        newAnalysis.analysis_version = prevAnalysis.analysis_version + 1;
      }

      const persisted = await this.aiAnalysisRepository.create(newAnalysis);

      return persisted;
    });
  }
}
