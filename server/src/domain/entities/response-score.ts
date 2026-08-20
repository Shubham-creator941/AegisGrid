export interface ResponseScore {
  id: string;
  response_candidate_id: string;
  overall_score: number;
  dimension_scores: unknown;
  weights: unknown;
  scoring_version: string;
  calculated_at: Date;
}
