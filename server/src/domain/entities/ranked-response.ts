export interface RankedResponse {
  id: string;
  evaluation_id: string;
  response_candidate_id: string;
  rank: number;
  score: number;
  ranking_version: string;
  created_at: Date;
}
