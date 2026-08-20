export interface ConstraintEvaluation {
  id: string;
  response_candidate_id: string;
  feasible: boolean;
  violations: unknown;
  constraint_version: string;
  evaluated_at: Date;
}
