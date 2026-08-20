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
  created_at: Date;
  created_by: string;
}
