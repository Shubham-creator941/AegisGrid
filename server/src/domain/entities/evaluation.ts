import { EvaluationStatus } from '../enums/index.js';

export interface Evaluation {
  id: string;
  scenario_id: string;
  network_snapshot_id: string;
  risk_assessment_id: string;
  status: EvaluationStatus;
  started_at: Date;
  completed_at: Date | null;
  engine_version: string;
  created_at: Date;
}
