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

export interface EvaluationResult {
  evaluation: Evaluation;
  simulation: any | null;
  impact: ImpactAssessment | null;
  responses: any[];
  constraints: any[];
  scores: any[];
  ranking: any[];
  recommendation: any | null;
}

export const EvaluationsApi = {
  getEvaluationStatus: (id: string) => apiClient.get<{ success: boolean, data: Evaluation }>(`/api/v1/evaluations/${id}`).then(res => res.data.data),
  getEvaluationResult: (id: string) => apiClient.get<{ success: boolean, data: EvaluationResult }>(`/api/v1/evaluations/${id}/result`).then(res => res.data.data),
};
