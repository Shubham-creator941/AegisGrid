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

export const EventsApi = {
  getEvents: () => apiClient.get<{ data: Event[], meta: any }>('/api/v1/events').then(res => res.data),
  getEvent: (id: string) => apiClient.get<Event>(`/api/v1/events/${id}`).then(res => res.data),
  getEvidence: (eventId: string) => apiClient.get<{ data: Evidence[], meta: any }>(`/api/v1/events/${eventId}/evidence`).then(res => res.data),
};
