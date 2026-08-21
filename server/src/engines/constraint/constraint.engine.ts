import { ConstraintEngine, ConstraintInput } from '../../application/interfaces/engines.js';
import { ConstraintEvaluation } from '../../domain/entities/constraint-evaluation.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class DeterministicConstraintEngine implements ConstraintEngine {
  public async evaluate(input: ConstraintInput): Promise<ConstraintEvaluation> {
    this.validateInput(input);

    // The authoritative specification ("Context of aegis.pdf") defines the ConstraintEngine 
    // contract but does NOT provide a numerical algorithm or mathematical threshold 
    // for determining feasibility or discovering violations automatically.
    // 
    // In strict adherence to Task 4.6 constraints ("do not invent optimization or capacity formulas", 
    // "use the smallest deterministic source-supported behavior"), we return a deterministic 
    // feasible result.

    return {
      id: `eval-${input.responseCandidate.id}`,
      response_candidate_id: input.responseCandidate.id,
      feasible: true,
      violations: {}, // No invented violations
      constraint_version: '1.0.0-deterministic',
      evaluated_at: new Date(0) // Deterministic epoch
    };
  }

  private validateInput(input: ConstraintInput): void {
    if (!input) {
      throw new BusinessRuleError('INVALID_CONSTRAINT_INPUT', 'Constraint input is required');
    }
    if (!input.responseCandidate) {
      throw new BusinessRuleError('INVALID_CONSTRAINT_INPUT', 'Constraint requires responseCandidate');
    }
    if (!input.scenarioContext) {
      throw new BusinessRuleError('INVALID_CONSTRAINT_INPUT', 'Constraint requires scenarioContext');
    }
    if (!input.networkSnapshot) {
      throw new BusinessRuleError('INVALID_CONSTRAINT_INPUT', 'Constraint requires networkSnapshot');
    }
  }
}
