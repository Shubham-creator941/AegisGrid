import { BusinessRuleError } from '../errors/index.js';

export class ResponseRules {
  public static validateResponseFeasibility(feasible: boolean): void {
    if (!feasible) {
      throw new BusinessRuleError(
        'INFEASIBLE_RESPONSE',
        'An infeasible response cannot be recommended',
        { condition: 'feasible == true' }
      );
    }
  }
}
