export interface ImpactAssessment {
  id: string;
  evaluation_id: string;
  supply_impact: number;
  economic_impact: number;
  operational_impact: number;
  reserve_impact: number;
  resilience_impact: number;
  overall_impact: number;
  calculation_version: string;
  created_at: Date;
}
