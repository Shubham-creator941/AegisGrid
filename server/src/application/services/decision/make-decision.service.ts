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
import { ResponseCandidateRepository } from '../../../repositories/interfaces/response-candidate.repository.js';
import { ConstraintEvaluationRepository } from '../../../repositories/interfaces/constraint-evaluation.repository.js';

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
    private candidateRepo: ResponseCandidateRepository,
    private constraintRepo: ConstraintEvaluationRepository,
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

      const isModify = input.decision_type === 'MODIFY';
      const isAccept = input.decision_type === 'ACCEPT';
      const isReject = input.decision_type === 'REJECT';

      if (isReject && !input.reason) {
        throw new BusinessRuleError('RATIONALE_REQUIRED', 'Rationale is required for REJECT decision');
      }

      if (isModify && !input.selected_response_id) {
        throw new BusinessRuleError('SELECTED_RESPONSE_REQUIRED', 'Selected response ID is required for MODIFY decision');
      }

      const finalSelectedResponseId = input.selected_response_id || recommendation.response_candidate_id;

      if (isAccept && finalSelectedResponseId !== recommendation.response_candidate_id) {
        throw new BusinessRuleError('INVALID_SELECTED_RESPONSE', 'Selected response must equal recommended response for ACCEPT decision');
      }

      if (isAccept || isModify) {
        const candidate = await this.candidateRepo.findById(finalSelectedResponseId);
        if (!candidate) {
          throw new BusinessRuleError('CANDIDATE_NOT_FOUND', 'Selected response candidate not found');
        }
        if (candidate.evaluation_id !== evaluation.id) {
          throw new BusinessRuleError('INVALID_CANDIDATE', 'Selected response candidate does not belong to the same evaluation');
        }

        const constraints = await this.constraintRepo.listByCandidateId(finalSelectedResponseId);
        const isFeasible = constraints.length > 0 && constraints.every(c => c.feasible);
        if (!isFeasible) {
          throw new BusinessRuleError('INFEASIBLE_RESPONSE', 'Selected response is not feasible');
        }
      }

      const newDecision: Omit<Decision, 'id' | 'created_at' | 'updated_at'> = {
        recommendation_id: input.recommendation_id,
        decision_type: input.decision_type as any,
        selected_response_id: finalSelectedResponseId,
        reason: input.reason,
        decided_by: input.decided_by,
        modification_notes: isModify ? input.reason : null,
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
