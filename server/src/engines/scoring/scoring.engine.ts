import { ScoringEngine, ScoringInput } from '../../application/interfaces/engines.js';
import { ResponseScore } from '../../domain/entities/response-score.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class DeterministicScoringEngine implements ScoringEngine {
  public async score(input: ScoringInput): Promise<ResponseScore> {
    this.validateInput(input);

    // The authoritative specification ("Context of aegis.pdf") defines that this engine 
    // calculates a ResponseScore. However, it does NOT provide numerical scoring 
    // formulas, dimensions, or weights, explicitly forbidding AI-generated or invented weights.
    // 
    // In strict adherence to Task 4.4 constraints, we implement the smallest deterministic 
    // structural foundation. We return a deterministic score of 0 with empty dimensions 
    // to preserve the contract without manufacturing arbitrary business logic.
    return {
      id: `${input.responseCandidate.id}-score`,
      response_candidate_id: input.responseCandidate.id,
      overall_score: 0,
      dimension_scores: {},
      weights: {},
      scoring_version: '1.0.0-deterministic',
      calculated_at: new Date(0) // deterministic epoch instead of Date.now()
    };
  }

  private validateInput(input: ScoringInput): void {
    if (!input) {
      throw new BusinessRuleError('INVALID_SCORING_INPUT', 'Scoring input is required');
    }
    if (!input.responseCandidate) {
      throw new BusinessRuleError('INVALID_SCORING_INPUT', 'Scoring requires responseCandidate');
    }
    if (!input.constraintEvaluation) {
      throw new BusinessRuleError('INVALID_SCORING_INPUT', 'Scoring requires constraintEvaluation');
    }
    if (!input.impactAssessment) {
      throw new BusinessRuleError('INVALID_SCORING_INPUT', 'Scoring requires impactAssessment');
    }
    if (!input.scenarioContext) {
      throw new BusinessRuleError('INVALID_SCORING_INPUT', 'Scoring requires scenarioContext');
    }
  }
}
