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

    const ranked: RankedResponse[] = [...input.scores]
      .sort((a, b) => {
        // 1. score DESC
        if (a.overall_score !== b.overall_score) {
          return b.overall_score - a.overall_score;
        }

        const aDims = a.dimension_scores as any || {};
        const bDims = b.dimension_scores as any || {};

        // 2. coverage DESC
        const aCov = aDims.coverage || 0;
        const bCov = bDims.coverage || 0;
        if (aCov !== bCov) {
          return bCov - aCov;
        }

        // 3. candidate.volume DESC
        const aVol = aDims.candidateVolume || 0;
        const bVol = bDims.candidateVolume || 0;
        if (aVol !== bVol) {
          return bVol - aVol;
        }

        // 4. candidate.type ASC
        const aType = aDims.candidateType || '';
        const bType = bDims.candidateType || '';
        if (aType !== bType) {
          return aType.localeCompare(bType);
        }

        // 5. candidate.id ASC
        return a.response_candidate_id.localeCompare(b.response_candidate_id);
      })
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
