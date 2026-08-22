import { DecisionRepository } from '../../../repositories/interfaces/decision.repository.js';
import { RecommendationRepository } from '../../../repositories/interfaces/recommendation.repository.js';
import { Decision } from '../../../domain/entities/index.js';
import { DecisionService } from '../../../domain/services/decision.service.js';
import { TransactionManager } from '../../interfaces/transaction-manager.interface.js';
import { ScenarioRepository } from '../../../repositories/interfaces/scenario.repository.js';
import { EvaluationRepository } from '../../../repositories/interfaces/evaluation.repository.js';
import { AuditLogRepository } from '../../../repositories/interfaces/audit-log.repository.js';
import { ScenarioAggregate } from '../../../domain/aggregates/scenario.aggregate.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

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
    private evaluationRepo: EvaluationRepository,
    private scenarioRepo: ScenarioRepository,
    private auditLogRepo: AuditLogRepository,
    private transactionManager: TransactionManager
  ) {}

  async execute(input: MakeDecisionInput): Promise<Decision> {
    return this.transactionManager.execute(async () => {
      const recommendation = await this.recommendationRepo.findById(input.recommendation_id);
      if (!recommendation) {
        throw new BusinessRuleError('RECOMMENDATION_NOT_FOUND', 'Recommendation not found');
      }

      const existingDecision = await this.decisionRepo.findByRecommendationId(input.recommendation_id);
      
      const evaluation = await this.evaluationRepo.findById(recommendation.evaluation_id);
      if (!evaluation) {
        throw new BusinessRuleError('EVALUATION_NOT_FOUND', 'Evaluation not found');
      }

      const scenarioEntity = await this.scenarioRepo.findById(evaluation.scenario_id);
      if (!scenarioEntity) {
        throw new BusinessRuleError('SCENARIO_NOT_FOUND', 'Scenario not found');
      }

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
        !!existingDecision, 
        input.decision_type as any, 
        input.decided_by, 
        input.reason, 
        input.decision_type === 'MODIFY' ? input.reason : null
      );

      // Restore Scenario and transition
      const scenarioAgg = ScenarioAggregate.restore(scenarioEntity, []);
      scenarioAgg.decide();
      
      await this.scenarioRepo.update(scenarioEntity.id, { status: scenarioAgg.status });
      const savedDecision = await this.decisionRepo.create(newDecision as any);

      await this.auditLogRepo.create({
        actor_id: input.decided_by,
        action: `DECISION_${input.decision_type}`,
        entity_type: 'SCENARIO',
        entity_id: scenarioEntity.id,
        before_state: scenarioEntity.status,
        after_state: scenarioAgg.status,
        metadata: {
          decision_id: savedDecision.id,
          recommendation_id: recommendation.id,
          reason: input.reason
        }
      });

      return savedDecision;
    });
  }
}
