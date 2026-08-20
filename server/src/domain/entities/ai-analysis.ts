export interface AIAnalysis {
  id: string;
  event_id: string;
  model_name: string;
  model_version: string;
  analysis_version: number;
  structured_output: unknown;
  confidence: number;
  created_at: Date;
}
