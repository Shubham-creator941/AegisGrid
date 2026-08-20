import { ScenarioState } from 'shared';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  event_id: string;
  status: ScenarioState;
  scenario_version: number;
  start_time: Date;
  end_time: Date;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}
