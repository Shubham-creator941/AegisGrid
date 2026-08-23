import { apiClient } from '../../../api/client';


export type ScenarioState = 'DRAFT' | 'READY' | 'EVALUATING' | 'EVALUATED' | 'RECOMMENDED' | 'DECIDED' | 'FAILED';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  event_id: string;
  status: ScenarioState;
  scenario_version: number;
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ScenarioEvaluationResult {
  evaluation: { id: string; scenario_id: string; status: string };
  result: unknown;
}

export const ScenariosApi = {
  getScenarios: () => apiClient.get<{ data: Scenario[], meta: any }>('/api/v1/scenarios').then(res => res.data),
  getScenario: (id: string) => apiClient.get<Scenario>(`/api/v1/scenarios/${id}`).then(res => res.data),
  createScenario: (data: { name: string, description: string, event_id: string, created_by: string }) => 
    apiClient.post<Scenario>('/api/v1/scenarios', data).then(res => res.data),
  evaluateScenario: (id: string, idempotencyKey?: string) => 
    apiClient.post<{ success: boolean, data: ScenarioEvaluationResult }>(`/api/v1/scenarios/${id}/evaluate`, { idempotency_key: idempotencyKey }).then(res => res.data)
};
