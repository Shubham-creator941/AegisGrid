import { BusinessRuleError } from '../errors/index.js';

export class DecisionRules {
  public static assertDecisionNotExists(hasExistingDecision: boolean): void {
    if (hasExistingDecision) {
      throw new BusinessRuleError(
        'DECISION_ALREADY_RECORDED',
        'The same recommendation cannot receive another decision',
        { condition: 'hasExistingDecision == false' }
      );
    }
  }
}
