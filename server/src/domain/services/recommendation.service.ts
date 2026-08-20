import { ResponseCandidate, Recommendation } from '../entities/index.js';
import { ResponseRules } from '../rules/index.js';
import { randomUUID } from 'crypto';

export class RecommendationService {
  public static createRecommendation(
    candidate: ResponseCandidate,
    isFeasible: boolean,
    rank: number,
    score: number,
    rationale: string,
    confidence: number
  ): Recommendation {
    // An infeasible response cannot be recommended
    ResponseRules.validateResponseFeasibility(isFeasible);
    
    return {
      id: randomUUID(),
      evaluation_id: candidate.evaluation_id,
      response_candidate_id: candidate.id,
      rank,
      score,
      rationale,
      tradeoffs: [],
      uncertainty: [],
      confidence,
      created_at: new Date(),
    };
  }
}
