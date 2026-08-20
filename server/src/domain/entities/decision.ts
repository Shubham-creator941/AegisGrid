import { DecisionType } from 'shared';

export interface Decision {
  id: string;
  recommendation_id: string;
  decision_type: DecisionType;
  selected_response_id: string;
  modification_notes: string | null;
  reason: string;
  decided_by: string;
  decided_at: Date;
}
