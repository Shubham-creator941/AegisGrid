import { apiClient } from '../../../api/client';
import { DecisionType } from 'shared';

export interface DecisionPayload {
  decision: DecisionType;
  selected_response_id: string;
  rationale: string;
}

export const DecisionsApi = {
  makeDecision: (recommendationId: string, payload: DecisionPayload) =>
    apiClient.post(`/api/v1/recommendations/${recommendationId}/decision`, payload).then(res => res.data),

  getDecision: (recommendationId: string) =>
    apiClient.get(`/api/v1/recommendations/${recommendationId}/decision`).then(res => res.data),
};
