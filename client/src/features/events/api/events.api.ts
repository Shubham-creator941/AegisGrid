import { apiClient } from '../../../api/client';

export type EventType = 'GEOPOLITICAL' | 'NATURAL_DISASTER' | 'LOGISTICAL' | 'CYBER' | 'ECONOMIC' | 'REGULATORY' | 'UNKNOWN';
export type EventState = 'OPEN' | 'ANALYZED' | 'ASSESSED' | 'CLOSED';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  severity: string;
  status: EventState;
  occurred_at: string;
  detected_at: string;
  affected_region: string;
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  event_id: string;
  source_type: string;
  source_name: string;
  source_reference: string;
  content: string;
  published_at: string | null;
  retrieved_at: string;
  confidence: number | null;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  event_id: string;
  model_name: string;
  model_version: string;
  analysis_version: number;
  structured_output: any;
  confidence: number;
  created_at: string;
}

export interface RiskAssessment {
  id: string;
  event_id: string;
  assessment_version: number;
  probability: number;
  severity: number;
  exposure: number;
  confidence: number;
  risk_level: string;
  assessment_basis: string;
  created_at: string;
  created_by: string;
}

export const EventsApi = {
  getEvents: () => apiClient.get<{ data: Event[], meta: any }>('/api/v1/events').then(res => res.data),
  getEvent: (id: string) => apiClient.get<Event>(`/api/v1/events/${id}`).then(res => res.data),
  getEvidence: (eventId: string) => apiClient.get<{ data: Evidence[], meta: any }>(`/api/v1/events/${eventId}/evidence`).then(res => res.data),
  
  // Note: GET endpoints for analysis/risk might not exist in backend yet, handled gracefully by hooks mapping 404 to null
  getAnalysis: (eventId: string) => apiClient.get<AIAnalysis>(`/api/v1/events/${eventId}/analysis`).then(res => res.data),
  getRiskAssessment: (eventId: string) => apiClient.get<RiskAssessment>(`/api/v1/events/${eventId}/risk-assessments`).then(res => res.data),
  
  analyzeEvent: (eventId: string) => apiClient.post<AIAnalysis>(`/api/v1/events/${eventId}/analyze`).then(res => res.data),
  createRiskAssessment: (eventId: string, data: Partial<RiskAssessment>) => apiClient.post<RiskAssessment>(`/api/v1/events/${eventId}/risk-assessments`, data).then(res => res.data),
};
