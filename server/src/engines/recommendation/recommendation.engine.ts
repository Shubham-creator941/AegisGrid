import { RecommendationEngine, RecommendationInput } from '../../application/interfaces/engines.js';
import { Recommendation } from '../../domain/entities/recommendation.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class DeterministicRecommendationEngine implements RecommendationEngine {
  public async recommend(input: RecommendationInput): Promise<Recommendation> {
    this.validateInput(input);

    if (input.rankedResponses.length === 0) {
      return null as any;
    }

    // The authoritative specification ("Context of aegis.pdf") defines that this engine 
    // "chooses the highest valid ranked response according to frozen rules. It does not invent new candidates."
    // We find the candidate with the numerically lowest 'rank' value (highest rank).
    const highestRanked = input.rankedResponses.reduce((prev, current) => {
      return (current.rank < prev.rank) ? current : prev;
    });

    // The PDF explicitly forbids inventing AI-generated rationales, weights, or un-supported logic.
    // Thus, we populate the structural entity with minimal deterministic fields to preserve the contract.
    return {
      id: `rec-${highestRanked.response_candidate_id}`,
      evaluation_id: highestRanked.evaluation_id,
      response_candidate_id: highestRanked.response_candidate_id,
      rank: highestRanked.rank,
      score: highestRanked.score,
      rationale: 'Deterministic rationale: Selected the highest ranked response according to frozen rules.',
      tradeoffs: [],
      uncertainty: [],
      confidence: 1.0, // Deterministic neutral confidence
      created_at: new Date(0) // Deterministic epoch
    };
  }

  private validateInput(input: RecommendationInput): void {
    if (!input) {
      throw new BusinessRuleError('INVALID_RECOMMENDATION_INPUT', 'Recommendation input is required');
    }
    if (!input.rankedResponses || !Array.isArray(input.rankedResponses)) {
      throw new BusinessRuleError('INVALID_RECOMMENDATION_INPUT', 'Recommendation requires rankedResponses array');
    }
  }
}
