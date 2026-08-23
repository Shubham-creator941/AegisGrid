import { apiClient } from '../../../api/client';

export type EvaluationStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface Evaluation {
  id: string;
  scenario_id: string;
  network_snapshot_id: string;
  risk_assessment_id: string;
  status: EvaluationStatus;
  started_at: string;
  completed_at: string | null;
  engine_version: string;
  created_at: string;
}

export interface ImpactAssessment {
  id: string;
  evaluation_id: string;
  supply_impact: number;
  economic_impact: number;
  operational_impact: number;
  reserve_impact: number;
  resilience_impact: number;
  overall_impact: number;
  calculation_version: string;
  created_at: string;
}

export interface EvaluationResponseCandidate {
  id: string;
  evaluation_id: string;
  response_type?: string;
  action_type?: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  status: string;
}

export interface EvaluationConstraint {
  id: string;
  response_candidate_id: string;
  feasible: boolean;
  violations: string[];
  constraint_version?: string;
  evaluated_at?: string;
}

export interface EvaluationScore {
  id: string;
  response_candidate_id: string;
  overall_score: number;
  dimension_scores?: Record<string, number>;
  weights?: Record<string, number>;
  scoring_version?: string;
  calculated_at?: string;
}

export interface EvaluationRanking {
  candidate: { id: string };
  score?: { overall_score: number };
  rank: number;
}

export interface EvaluationRecommendation {
  id: string;
  evaluation_id: string;
  response_candidate_id: string;
  rank: number;
  score: number;
  confidence: number;
  rationale: string;
  tradeoffs: string[];
  uncertainty?: number;
  created_at?: string;
}

export interface EvaluationResult {
  evaluation: Evaluation;
  simulation: any | null;
  impact: ImpactAssessment | null;
  responses: EvaluationResponseCandidate[];
  constraints: EvaluationConstraint[];
  scores: EvaluationScore[];
  ranking: EvaluationRanking[];
  recommendation: EvaluationRecommendation | null;
}

export const EvaluationsApi = {
  getEvaluationStatus: (id: string) => apiClient.get<{ success: boolean, data: Evaluation }>(`/api/v1/evaluations/${id}`).then(res => res.data.data),
  getEvaluationResult: (id: string) => apiClient.get<{ success: boolean, data: EvaluationResult }>(`/api/v1/evaluations/${id}/result`).then(res => res.data.data),
};
