import { ScenarioState } from 'shared';
import { BusinessRuleError } from '../errors/index.js';

export class ScenarioRules {
  public static validateReadyForEvaluation(scenarioStatus: ScenarioState, hasEvent: boolean, hasEvidenceOrAnalysis: boolean, hasRiskAssessment: boolean): void {
    if (scenarioStatus !== ScenarioState.DRAFT && scenarioStatus !== ScenarioState.READY) {
      throw new BusinessRuleError(
        'SCENARIO_NOT_READY',
        'Scenario must be in DRAFT or READY state to begin evaluation',
        { field: 'status', value: scenarioStatus, expected: [ScenarioState.DRAFT, ScenarioState.READY] }
      );
    }

    if (!hasEvent) {
      throw new BusinessRuleError(
        'SCENARIO_NOT_READY',
        'Scenario evaluation requires an associated event',
        { field: 'event', condition: 'exists' }
      );
    }

    if (!hasEvidenceOrAnalysis) {
      throw new BusinessRuleError(
        'SCENARIO_NOT_READY',
        'Scenario evaluation requires evidence or analysis',
        { field: 'evidence', condition: 'exists' }
      );
    }

    if (!hasRiskAssessment) {
      throw new BusinessRuleError(
        'SCENARIO_NOT_READY',
        'Scenario evaluation requires a risk assessment',
        { field: 'risk_assessment', condition: 'exists' }
      );
    }
  }

  public static assertScenarioIsEditable(scenarioStatus: ScenarioState): void {
    const uneditableStates = [
      ScenarioState.EVALUATING,
      ScenarioState.EVALUATED,
      ScenarioState.RECOMMENDED,
      ScenarioState.DECIDED,
      ScenarioState.CANCELLED,
    ];

    if (uneditableStates.includes(scenarioStatus)) {
      throw new BusinessRuleError(
        'SCENARIO_NOT_EDITABLE',
        'Scenario mutation is prohibited after evaluation has begun',
        { field: 'status', value: scenarioStatus }
      );
    }
  }
}
