import { EventType } from '../enums/index.js';
import { EventState } from 'shared';

export interface Event {
  id: string;
  title: string;
  description: string;
  event_type: EventType;
  severity: string;
  status: EventState;
  occurred_at: Date;
  detected_at: Date;
  affected_region: string;
  created_at: Date;
  updated_at: Date;
}
