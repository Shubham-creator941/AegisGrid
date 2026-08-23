import { ScoringEngine, ScoringInput } from '../../application/interfaces/engines.js';
import { ResponseScore } from '../../domain/entities/response-score.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class DeterministicScoringEngine implements ScoringEngine {
  public async score(input: ScoringInput): Promise<ResponseScore> {
    this.validateInput(input);

    const params = input.responseCandidate.parameters as any || {};
    const candidateVolume = params.volume || 0;
    const simulationResult = input.scenarioContext.simulationResult;
    const disruptedVolume = simulationResult?.affected_capacity || 0;
    const requiredShortfall = simulationResult?.shortfall || 0;

    let supplyImpact = 0;
    if (disruptedVolume > 0) {
      supplyImpact = Math.min(Math.max(candidateVolume / disruptedVolume, 0), 1);
    }
    
    let coverage = 0;
    let shortfallScore = 0;
    let remainingShortfall = requiredShortfall;

    if (requiredShortfall > 0) {
      coverage = Math.min(Math.max(candidateVolume / requiredShortfall, 0), 1);
      remainingShortfall = Math.max(requiredShortfall - candidateVolume, 0);
      shortfallScore = Math.min(Math.max(1 - (remainingShortfall / requiredShortfall), 0), 1);
    }

    const costScore = 0.5;
    const timeScore = 0.5;
    const riskScore = 0.5;
    const resilienceScore = coverage;

    const weights = {
      supplyImpact: 0.30,
      coverage: 0.25,
      shortfallScore: 0.20,
      costScore: 0.10,
      timeScore: 0.05,
      riskScore: 0.05,
      resilienceScore: 0.05
    };

    const overallScore = 
        weights.supplyImpact * supplyImpact
      + weights.coverage * coverage
      + weights.shortfallScore * shortfallScore
      + weights.costScore * costScore
      + weights.timeScore * timeScore
      + weights.riskScore * riskScore
      + weights.resilienceScore * resilienceScore;

    return {
      id: `${input.responseCandidate.id}-score`,
      response_candidate_id: input.responseCandidate.id,
      overall_score: overallScore,
      dimension_scores: {
        supplyImpact,
        coverage,
        shortfallScore,
        costScore,
        timeScore,
        riskScore,
        resilienceScore,
        candidateVolume,
        candidateType: input.responseCandidate.response_type
      },
      weights: weights as any,
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
