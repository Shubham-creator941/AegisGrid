import { EventRepository } from '../../../repositories/interfaces/event.repository.js';
import { ScenarioRepository } from '../../../repositories/interfaces/scenario.repository.js';
import { ScenarioAssumptionRepository } from '../../../repositories/interfaces/scenario-assumption.repository.js';
import { AIAnalysisRepository } from '../../../repositories/interfaces/ai-analysis.repository.js';
import { NetworkRepository } from '../../../repositories/interfaces/network.repository.js';
import { RiskAssessmentRepository } from '../../../repositories/interfaces/risk-assessment.repository.js';
import { EvaluationRepository } from '../../../repositories/interfaces/evaluation.repository.js';
import { ResponseCandidateRepository } from '../../../repositories/interfaces/response-candidate.repository.js';
import { ConstraintEvaluationRepository } from '../../../repositories/interfaces/constraint-evaluation.repository.js';
import { ResponseScoreRepository } from '../../../repositories/interfaces/response-score.repository.js';
import { RecommendationRepository } from '../../../repositories/interfaces/recommendation.repository.js';
import { ImpactAssessmentRepository } from '../../../repositories/interfaces/impact-assessment.repository.js';

import { EvaluationOrchestrator, EvaluationRequest } from './evaluation-orchestrator.js';
import { TransactionManager } from '../../interfaces/transaction-manager.interface.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';
import { ScenarioAggregate } from '../../../domain/aggregates/scenario.aggregate.js';

export class ScenarioEvaluationService {
  constructor(
    private eventRepo: EventRepository,
    private scenarioRepo: ScenarioRepository,
    private assumptionRepo: ScenarioAssumptionRepository,
    private aiAnalysisRepo: AIAnalysisRepository,
    private networkRepo: NetworkRepository,
    private riskAssessmentRepo: RiskAssessmentRepository,
    private evaluationRepo: EvaluationRepository,
    private impactRepo: ImpactAssessmentRepository,
    private candidateRepo: ResponseCandidateRepository,
    private constraintRepo: ConstraintEvaluationRepository,
    private scoreRepo: ResponseScoreRepository,
    private recommendationRepo: RecommendationRepository,
    private orchestrator: EvaluationOrchestrator,
    private txManager: TransactionManager
  ) {}

  async evaluateScenario(scenarioId: string): Promise<any> {
    return this.txManager.execute(async () => {
      const scenarioEntity = await this.scenarioRepo.findById(scenarioId);
      if (!scenarioEntity) {
        throw new BusinessRuleError('SCENARIO_NOT_FOUND', `Scenario ${scenarioId} not found`);
      }

      const event = await this.eventRepo.findById(scenarioEntity.event_id);
      if (!event) {
        throw new BusinessRuleError('EVENT_NOT_FOUND', `Event ${scenarioEntity.event_id} not found`);
      }

      // Check if analysis exists (assuming it is required per PDF stating "Verify the Event has the required successful analysis/evidence state")
      const aiAnalysis = await this.aiAnalysisRepo.findByEventId(event.id);
      if (!aiAnalysis) {
        throw new BusinessRuleError('ANALYSIS_NOT_READY', `Event ${event.id} lacks AI analysis required for evaluation`);
      }

      const riskAssessment = await this.riskAssessmentRepo.findByEventId(event.id);
      
      const assumptions = await this.assumptionRepo.listByScenarioId(scenarioId);
      
      const scenarioAgg = ScenarioAggregate.restore(scenarioEntity, assumptions);

      // Verify ready for evaluation and begin
      scenarioAgg.markReady(!!event, !!aiAnalysis, !!riskAssessment);
      scenarioAgg.beginEvaluation();

      const networkSnapshot = await this.networkRepo.getLatestSnapshot();
      if (!networkSnapshot) {
        throw new BusinessRuleError('NETWORK_SNAPSHOT_NOT_FOUND', `No network snapshot available for evaluation`);
      }

      const request: EvaluationRequest = {
        scenario: scenarioAgg.currentScenario,
        disruption: event,
        networkSnapshot,
        riskAssessment: riskAssessment || undefined,
        assumptions: scenarioAgg.currentAssumptions as any
      };

      const result = await this.orchestrator.evaluate(request);

      const evaluation = await this.evaluationRepo.create({
        scenario_id: scenarioId,
        network_snapshot_id: networkSnapshot.id,
        risk_assessment_id: riskAssessment ? riskAssessment.id : 'none',
        status: 'COMPLETED' as any,
        started_at: new Date(),
        completed_at: new Date(),
        engine_version: '1.0.0'
      });
      
      await this.impactRepo.create({
        evaluation_id: evaluation.id,
        supply_impact: result.impact.supply_impact,
        economic_impact: result.impact.economic_impact,
        operational_impact: result.impact.operational_impact,
        reserve_impact: result.impact.reserve_impact,
        resilience_impact: result.impact.resilience_impact,
        overall_impact: result.impact.overall_impact,
        calculation_version: result.impact.calculation_version
      });

      const candidateIdMap = new Map<string, string>();
      
      for (const candidate of result.responses) {
        const savedCandidate = await this.candidateRepo.create({
          evaluation_id: evaluation.id,
          response_type: candidate.response_type,
          name: candidate.name,
          description: candidate.description,
          parameters: candidate.parameters,
          status: candidate.status
        });
        candidateIdMap.set(candidate.id, savedCandidate.id);
      }

      for (const constraint of result.constraints) {
        const dbCandidateId = candidateIdMap.get(constraint.response_candidate_id) || constraint.response_candidate_id;
        await this.constraintRepo.create({
          response_candidate_id: dbCandidateId,
          feasible: constraint.feasible,
          violations: constraint.violations,
          constraint_version: constraint.constraint_version,
          evaluated_at: constraint.evaluated_at || new Date()
        } as any);
      }

      for (const score of result.scores) {
        const dbCandidateId = candidateIdMap.get(score.response_candidate_id) || score.response_candidate_id;
        await this.scoreRepo.create({
          response_candidate_id: dbCandidateId,
          overall_score: score.overall_score,
          dimension_scores: score.dimension_scores,
          weights: score.weights,
          scoring_version: score.scoring_version,
          calculated_at: score.calculated_at || new Date()
        } as any);
      }

      if (result.recommendation) {
        const dbCandidateId = candidateIdMap.get(result.recommendation.response_candidate_id) || result.recommendation.response_candidate_id;
        await this.recommendationRepo.create({
          evaluation_id: evaluation.id,
          response_candidate_id: dbCandidateId,
          rank: result.recommendation.rank,
          score: result.recommendation.score,
          rationale: result.recommendation.rationale,
          tradeoffs: result.recommendation.tradeoffs,
          uncertainty: result.recommendation.uncertainty,
          confidence: result.recommendation.confidence
        } as any);
        scenarioAgg.completeEvaluation();
        scenarioAgg.recommend();
      } else {
        scenarioAgg.completeEvaluation();
      }

      await this.scenarioRepo.update(scenarioId, { status: scenarioAgg.currentScenario.status });

      return {
        evaluation,
        result
      };
    });
  }
}
