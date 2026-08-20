export interface ResponseCandidate {
  id: string;
  evaluation_id: string;
  response_type: string;
  name: string;
  description: string;
  parameters: unknown;
  status: string;
  created_at: Date;
}
