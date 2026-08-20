export interface ScenarioAssumption {
  id: string;
  scenario_id: string;
  parameter_name: string;
  parameter_type: string;
  parameter_value: string | number | boolean;
  unit: string | null;
  source: string;
  confidence: number;
  created_at: Date;
}
