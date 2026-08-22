import { DecisionRepository } from '../../../repositories/interfaces/decision.repository.js';
import { RecommendationRepository } from '../../../repositories/interfaces/recommendation.repository.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

export class GetDecisionApplicationService {
  constructor(
    private decisionRepo: DecisionRepository,
    private recommendationRepo: RecommendationRepository
  ) {}

  async execute(recommendationId: string) {
    const recommendation = await this.recommendationRepo.findById(recommendationId);
    if (!recommendation) {
      throw new BusinessRuleError('RECOMMENDATION_NOT_FOUND', 'Recommendation not found');
    }

    const decision = await this.decisionRepo.findByRecommendationId(recommendationId);
    
    // We don't throw if no decision is found; we can just return null or the recommendation itself
    return {
      success: true,
      data: {
        recommendation,
        decision: decision || null
      }
    };
  }
}
