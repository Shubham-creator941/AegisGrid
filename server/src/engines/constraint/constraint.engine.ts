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

    const candidate = input.responseCandidate;
    const params = candidate.parameters as any || {};
    const volume = params.volume || 0;
    const altFlowId = params.altFlowId;
    
    // Default feasible, accumulate violations
    let feasible = true;
    const violations: string[] = [];

    // POSITIVE VOLUME
    if (volume <= 0) {
      feasible = false;
      violations.push('Volume must be positive');
    }

    // DISRUPTION EXCLUSION
    const snapshotData = input.networkSnapshot.snapshot_data as any || {};
    const affectedFlowIds = snapshotData.affected_flow_ids || [];
    if (altFlowId && affectedFlowIds.includes(altFlowId)) {
      feasible = false;
      violations.push('Cannot use a disrupted network element');
    }

    // The authoritative specification ("Context of aegis.pdf") defines the ConstraintEngine 
    // contract. We now apply the exact constraints from PAD-003 Section 7.

    return {
      id: `eval-${input.responseCandidate.id}`,
      response_candidate_id: input.responseCandidate.id,
      feasible: feasible,
      violations: violations,
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
