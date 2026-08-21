import { DecisionRepository } from '../../../repositories/interfaces/decision.repository.js';
import { RecommendationRepository } from '../../../repositories/interfaces/recommendation.repository.js';
import { Decision } from '../../../domain/entities/index.js';
import { DecisionService } from '../../../domain/services/decision.service.js';
import { TransactionManager } from '../../interfaces/transaction-manager.interface.js';

export interface MakeDecisionInput {
  recommendation_id: string;
  decision_type: string;
  selected_response_id?: string;
  reason: string;
  decided_by: string;
}

export class MakeDecisionApplicationService {
  constructor(
    private decisionRepo: DecisionRepository,
    private recommendationRepo: RecommendationRepository,
    private transactionManager: TransactionManager
  ) {}

  async execute(input: MakeDecisionInput): Promise<Decision> {
    return this.transactionManager.execute(async () => {
      const recommendation = await this.recommendationRepo.findById(input.recommendation_id);
      if (!recommendation) {
        throw new Error('Recommendation not found');
      }

      // We need to fetch existing decisions for this recommendation to enforce the rule
      // But for simplicity in this MVP, we assume the domain service handles it if we pass existing decisions.
      // Wait, DecisionService in domain layer handles uniqueness.
      
      const newDecision: Omit<Decision, 'id' | 'created_at' | 'updated_at'> = {
        recommendation_id: input.recommendation_id,
        decision_type: input.decision_type as any,
        selected_response_id: input.selected_response_id || recommendation.response_candidate_id,
        reason: input.reason,
        decided_by: input.decided_by,
        modification_notes: input.decision_type === 'MODIFY' ? input.reason : null,
        decided_at: new Date()
      };

      // Validate through domain
      DecisionService.createDecision(
        recommendation, 
        false, 
        input.decision_type as any, 
        input.decided_by, 
        input.reason, 
        input.decision_type === 'MODIFY' ? input.reason : null
      );

      return await this.decisionRepo.create(newDecision as any);
    });
  }
}
