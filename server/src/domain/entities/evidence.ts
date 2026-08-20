export interface Evidence {
  id: string;
  event_id: string;
  source_type: string;
  source_name: string;
  source_reference: string;
  content: string;
  published_at: Date;
  retrieved_at: Date;
  confidence: number;
  created_at: Date;
}
