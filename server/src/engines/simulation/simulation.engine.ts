import { SimulationEngine, SimulationInput, SimulationResult } from '../../application/interfaces/engines.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class DeterministicSimulationEngine implements SimulationEngine {
  private readonly ENGINE_VERSION = '1.0.0-deterministic';

  public async simulate(input: SimulationInput): Promise<SimulationResult> {
    this.validateInput(input);

    // The authoritative specification ("Context of aegis.pdf") does not provide a numerical simulation formula.
    // To avoid presenting invented formulas as authoritative, we return 0 for all calculated metrics.
    // This provides the smallest source-supported deterministic behavior.
    const availableSupply = 0;
    const affectedCapacity = 0;
    const shortfall = 0;

    const result: SimulationResult = {
      available_supply: availableSupply,
      affected_capacity: affectedCapacity,
      shortfall: shortfall,
      reserve_level: 0, // Explicitly isolated minimal behavior
      network_state: input.networkState.snapshot_data, // Propagates deterministic network state
      calculation_version: this.ENGINE_VERSION
    };

    return result;
  }

  private validateInput(input: SimulationInput): void {
    if (!input) {
      throw new BusinessRuleError('INVALID_SIMULATION_INPUT', 'Simulation input is required');
    }
    if (!input.networkState) {
      throw new BusinessRuleError('INVALID_SIMULATION_INPUT', 'Simulation requires networkState');
    }
    if (!input.scenario) {
      throw new BusinessRuleError('INVALID_SIMULATION_INPUT', 'Simulation requires scenario');
    }
    if (!input.disruption) {
      throw new BusinessRuleError('INVALID_SIMULATION_INPUT', 'Simulation requires disruption');
    }
    if (!input.assumptions) {
      throw new BusinessRuleError('INVALID_SIMULATION_INPUT', 'Simulation requires assumptions');
    }
  }
}
