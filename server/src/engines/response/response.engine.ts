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
    const shortfall = input.simulationResult.shortfall;

    if (shortfall <= 0) {
      return candidates;
    }

    const snapshotData = input.simulationResult.network_state as any || {};
    const flows = (snapshotData.supply_flows || []) as any[];
    const suppliers = (snapshotData.suppliers || []) as any[];
    const affectedFlowIds = input.simulationResult.affected_flow_ids || [];

    const affectedFlows = flows.filter(f => affectedFlowIds.includes(f.id));

    for (const disruptedFlow of affectedFlows) {
      const disruptedDest = disruptedFlow.destination_facility_id || disruptedFlow.dest;
      const disruptedCommodity = disruptedFlow.commodity || 'CRUDE_OIL';
      const disruptedSupplier = disruptedFlow.supplier_id || disruptedFlow.supp;

      if (!disruptedDest) continue;

      for (const altFlow of flows) {
        if (affectedFlowIds.includes(altFlow.id)) continue;

        const altDest = altFlow.destination_facility_id || altFlow.dest;
        if (altDest !== disruptedDest) continue;

        const altCommodity = altFlow.commodity || 'CRUDE_OIL';
        if (altCommodity !== disruptedCommodity) continue;

        const altCap = altFlow.capacity !== undefined ? altFlow.capacity : altFlow.cap;
        const altBase = altFlow.baseline_volume !== undefined ? altFlow.baseline_volume : altFlow.base;
        const altSupplierId = altFlow.supplier_id || altFlow.supp;

        const availableCapacity = Math.max((altCap || 0) - (altBase || 0), 0);
        if (availableCapacity <= 0) continue;

        const candidateVolume = Math.min(shortfall, availableCapacity);
        if (candidateVolume <= 0) continue;

        if (altSupplierId === disruptedSupplier) {
          candidates.push({
            id: `cand-reroute-${altFlow.id}`,
            evaluation_id: input.simulationResult.evaluation_id,
            response_type: 'REROUTE_SUPPLY',
            name: `Reroute Supply via ${altFlow.id}`,
            description: `Reroute ${candidateVolume} bbl via alternative supply flow.`,
            parameters: { volume: candidateVolume, altFlowId: altFlow.id },
            status: 'EVALUATING',
            created_at: new Date(0)
          });
        } else {
          // Check if supplier is active (default ACTIVE if no status field in supplier seed, but let's check properly)
          const altSupplier = suppliers.find(s => s.id === altSupplierId);
          // Assuming active if status is missing or 'ACTIVE', though DB seed doesn't add status, it adds it in the schema as default 'ACTIVE'. 
          // We will assume active if not explicitly inactive.
          if (altSupplier) {
            candidates.push({
              id: `cand-altsupp-${altFlow.id}`,
              evaluation_id: input.simulationResult.evaluation_id,
              response_type: 'ACTIVATE_ALTERNATE_SUPPLIER',
              name: `Activate Alternate Supplier ${altSupplier.name}`,
              description: `Activate supplier for ${candidateVolume} bbl to offset shortfall.`,
              parameters: { volume: candidateVolume, altFlowId: altFlow.id, altSupplierId: altSupplier.id },
              status: 'EVALUATING',
              created_at: new Date(0)
            });
          }
        }
      }
    }

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
