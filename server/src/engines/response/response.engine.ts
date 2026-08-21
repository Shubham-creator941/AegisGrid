import { ResponseEngine, ResponseInput } from '../../application/interfaces/engines.js';
import { ResponseCandidate } from '../../domain/entities/response-candidate.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class DeterministicResponseEngine implements ResponseEngine {
  public async generate(input: ResponseInput): Promise<ResponseCandidate[]> {
    this.validateInput(input);

    // The authoritative specification ("Context of aegis.pdf") defines that this engine 
    // generates candidate responses, but does NOT provide mathematical formulas, rules, 
    // or criteria for generating them numerically.
    // 
    // In strict adherence to Task 4.3 constraints ("do NOT invent optimization logic", 
    // "implement the smallest deterministic, source-supported behavior"), we return an 
    // empty deterministic array. This explicitly prevents unsupported AI, ranking, scoring, 
    // or candidate-generation behaviors from being claimed as authoritative.
    const candidates: ResponseCandidate[] = [];

    return candidates;
  }

  private validateInput(input: ResponseInput): void {
    if (!input) {
      throw new BusinessRuleError('INVALID_RESPONSE_INPUT', 'Response input is required');
    }
    if (!input.scenarioContext) {
      throw new BusinessRuleError('INVALID_RESPONSE_INPUT', 'Response requires scenarioContext');
    }
    if (!input.scenarioContext.scenario) {
      throw new BusinessRuleError('INVALID_RESPONSE_INPUT', 'Response scenarioContext requires scenario');
    }
    if (!input.scenarioContext.disruption) {
      throw new BusinessRuleError('INVALID_RESPONSE_INPUT', 'Response scenarioContext requires disruption');
    }
    if (!input.simulationResult) {
      throw new BusinessRuleError('INVALID_RESPONSE_INPUT', 'Response requires simulationResult');
    }
    if (!input.impactAssessment) {
      throw new BusinessRuleError('INVALID_RESPONSE_INPUT', 'Response requires impactAssessment');
    }
  }
}
