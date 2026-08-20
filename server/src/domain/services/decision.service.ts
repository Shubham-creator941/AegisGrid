import { Recommendation, Decision } from '../entities/index.js';
import { DecisionType } from 'shared';
import { DecisionRules } from '../rules/index.js';
import { randomUUID } from 'crypto';

export class DecisionService {
  public static createDecision(
    recommendation: Recommendation,
    hasExistingDecision: boolean,
    decisionType: DecisionType,
    decidedBy: string,
    reason: string,
    modificationNotes: string | null = null
  ): Decision {
    // Decision must not already exist
    DecisionRules.assertDecisionNotExists(hasExistingDecision);

    return {
      id: randomUUID(),
      recommendation_id: recommendation.id,
      decision_type: decisionType,
      selected_response_id: recommendation.response_candidate_id,
      modification_notes: modificationNotes,
      reason,
      decided_by: decidedBy,
      decided_at: new Date(),
    };
  }
}
