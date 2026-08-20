export interface Recommendation {
  id: string;
  evaluation_id: string;
  response_candidate_id: string;
  rank: number;
  score: number;
  rationale: string;
  tradeoffs: unknown[];
  uncertainty: unknown[];
  confidence: number;
  created_at: Date;
}
