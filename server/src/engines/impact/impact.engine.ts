import { ImpactEngine, ImpactInput } from '../../application/interfaces/engines.js';
import { ImpactAssessment } from '../../domain/entities/impact-assessment.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class DeterministicImpactEngine implements ImpactEngine {
  private readonly ENGINE_VERSION = '1.0.0-deterministic';

  public async calculate(input: ImpactInput): Promise<ImpactAssessment> {
    this.validateInput(input);

    // The authoritative specification ("Context of aegis.pdf") defines the dimensions 
    // of an Impact Assessment but does NOT provide mathematical formulas for calculating them 
    // from the SimulationResult.
    // 
    // In strict adherence to Task 4.2 constraints ("do NOT invent mathematics"), 
    // we return a deterministic, source-supported minimal representation (0 for all dimensions).
    // This explicitly prevents unsupported business calculations from being claimed as authoritative.
    const result: ImpactAssessment = {
      id: `impact-${input.scenarioContext.scenario.id}`,
      evaluation_id: `eval-${input.scenarioContext.scenario.id}`,
      supply_impact: 0,
      economic_impact: 0,
      operational_impact: 0,
      reserve_impact: 0,
      resilience_impact: 0,
      overall_impact: 0,
      calculation_version: this.ENGINE_VERSION,
      created_at: new Date(0)
    };

    return result;
  }

  private validateInput(input: ImpactInput): void {
    if (!input) {
      throw new BusinessRuleError('INVALID_IMPACT_INPUT', 'Impact input is required');
    }
    if (!input.simulationResult) {
      throw new BusinessRuleError('INVALID_IMPACT_INPUT', 'Impact requires simulationResult');
    }
    if (!input.scenarioContext) {
      throw new BusinessRuleError('INVALID_IMPACT_INPUT', 'Impact requires scenarioContext');
    }
    if (!input.scenarioContext.scenario) {
      throw new BusinessRuleError('INVALID_IMPACT_INPUT', 'Impact scenarioContext requires scenario');
    }
    if (!input.scenarioContext.disruption) {
      throw new BusinessRuleError('INVALID_IMPACT_INPUT', 'Impact scenarioContext requires disruption');
    }
  }
}
