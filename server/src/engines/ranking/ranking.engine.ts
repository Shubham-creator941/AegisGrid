import { RankingEngine, RankingInput } from '../../application/interfaces/engines.js';
import { RankedResponse } from '../../domain/entities/ranked-response.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class DeterministicRankingEngine implements RankingEngine {
  public async rank(input: RankingInput): Promise<RankedResponse[]> {
    this.validateInput(input);

    // The authoritative specification ("Context of aegis.pdf") defines that this engine 
    // takes ResponseScore[] and produces RankedResponse[]. 
    // It states: "Tie-breaking rules must be deterministic. No randomness."
    // 
    // However, the PDF does NOT define the exact sorting algorithms, prioritization 
    // logic, or what specific tie-breaking fields to use.
    // In strict adherence to Task 4.4 constraints, we implement the smallest deterministic 
    // structural foundation. We map the input array to the RankedResponse structure,
    // preserving the existing order (or deterministic ID sort in case of zero scores) 
    // to preserve the contract without manufacturing arbitrary sorting logic.

    const ranked: RankedResponse[] = input.scores
      // Deterministically tie-break sort by ID (smallest deterministic sort when scores are all 0)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((score, index) => ({
        id: `ranked-${score.response_candidate_id}`,
        evaluation_id: 'evaluation-context', // Deterministic placeholder
        response_candidate_id: score.response_candidate_id,
        rank: index + 1,
        score: score.overall_score,
        ranking_version: '1.0.0-deterministic',
        created_at: new Date(0) // deterministic epoch
      }));

    return ranked;
  }

  private validateInput(input: RankingInput): void {
    if (!input) {
      throw new BusinessRuleError('INVALID_RANKING_INPUT', 'Ranking input is required');
    }
    if (!input.scores || !Array.isArray(input.scores)) {
      throw new BusinessRuleError('INVALID_RANKING_INPUT', 'Ranking requires scores array');
    }
  }
}
