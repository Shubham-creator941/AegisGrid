import { EvaluationRepository } from '../../../repositories/interfaces/evaluation.repository.js';
import { ImpactAssessmentRepository } from '../../../repositories/interfaces/impact-assessment.repository.js';
import { ResponseCandidateRepository } from '../../../repositories/interfaces/response-candidate.repository.js';
import { ConstraintEvaluationRepository } from '../../../repositories/interfaces/constraint-evaluation.repository.js';
import { ResponseScoreRepository } from '../../../repositories/interfaces/response-score.repository.js';
import { RecommendationRepository } from '../../../repositories/interfaces/recommendation.repository.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

export class GetEvaluationService {
  constructor(
    private evaluationRepo: EvaluationRepository,
    private impactRepo: ImpactAssessmentRepository,
    private candidateRepo: ResponseCandidateRepository,
    private constraintRepo: ConstraintEvaluationRepository,
    private scoreRepo: ResponseScoreRepository,
    private recommendationRepo: RecommendationRepository
  ) {}

  async getEvaluationStatus(id: string) {
    const evaluation = await this.evaluationRepo.findById(id);
    if (!evaluation) {
      throw new BusinessRuleError('EVALUATION_NOT_FOUND', `Evaluation ${id} not found`);
    }
    return evaluation;
  }

  async getEvaluationResult(id: string) {
    const evaluation = await this.getEvaluationStatus(id);
    
    // In MVP, simulation is not persisted.
    const impact = await this.impactRepo.findByEvaluationId(id);
    const responses = await this.candidateRepo.listByEvaluationId(id);
    
    const candidateIds = responses.map(r => r.id);
    const constraints = [];
    const scores = [];
    
    for (const cId of candidateIds) {
      const cConstraints = await this.constraintRepo.listByCandidateId(cId);
      constraints.push(...cConstraints);
      
      const cScores = await this.scoreRepo.listByCandidateId(cId);
      scores.push(...cScores);
    }
    
    const recommendation = await this.recommendationRepo.findByEvaluationId(id);
    
    // Reconstruct EvaluationResult
    return {
      evaluation,
      simulation: null, // simulation not persisted in this MVP
      impact,
      responses,
      constraints,
      scores,
      ranking: [], // ranking not explicitly persisted
      recommendation
    };
  }

  async getRecommendation(id: string) {
    const evaluation = await this.evaluationRepo.findById(id);
    if (!evaluation) {
      throw new BusinessRuleError('EVALUATION_NOT_FOUND', `Evaluation ${id} not found`);
    }

    if (evaluation.status !== 'COMPLETED') {
      throw new BusinessRuleError('EVALUATION_INCOMPLETE', `Evaluation ${id} is not COMPLETED`);
    }

    const recommendation = await this.recommendationRepo.findByEvaluationId(id);
    if (!recommendation) {
      throw new BusinessRuleError('RECOMMENDATION_NOT_FOUND', `Recommendation for evaluation ${id} not found`);
    }

    const candidate = await this.candidateRepo.findById(recommendation.response_candidate_id);
    if (!candidate) {
      throw new BusinessRuleError('INVALID_RECOMMENDATION', `Recommended response candidate ${recommendation.response_candidate_id} not found`);
    }

    if (candidate.status !== 'FEASIBLE') {
      throw new BusinessRuleError('INVALID_RECOMMENDATION', `Recommended response candidate is not feasible`);
    }

    return {
      id: recommendation.id,
      evaluation_id: recommendation.evaluation_id,
      recommended_response: candidate,
      score: recommendation.score,
      confidence: recommendation.confidence,
      rationale: recommendation.rationale,
      tradeoffs: recommendation.tradeoffs || [],
      uncertainty: recommendation.uncertainty || []
    };
  }
}
