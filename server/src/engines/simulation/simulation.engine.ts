import { SimulationEngine, SimulationInput, SimulationResult } from '../../application/interfaces/engines.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class DeterministicSimulationEngine implements SimulationEngine {
  private readonly ENGINE_VERSION = '1.0.0-deterministic';

  public async simulate(input: SimulationInput): Promise<SimulationResult> {
    this.validateInput(input);

    // Deterministic foundational calculation
    // Does not invent advanced formulas, uses explicit deterministic transformations based on inputs
    const baseCapacity = 1000; // Baseline deterministic capacity
    let affectedCapacity = 0;
    
    // Minimal authoritative logic mapping severity to a deterministic impact foundation
    if (input.disruption.severity === 'CRITICAL') {
        affectedCapacity = 500;
    } else if (input.disruption.severity === 'HIGH') {
        affectedCapacity = 300;
    } else if (input.disruption.severity === 'MEDIUM') {
        affectedCapacity = 150;
    } else {
        affectedCapacity = 50;
    }

    // Assumptions modulate the capacity deterministically
    let assumptionModifier = 0;
    if (Array.isArray(input.assumptions)) {
      for (const assumption of input.assumptions) {
        if (typeof assumption.parameter_value === 'number') {
          // Simplistic deterministic modulation to prove the integration works
          assumptionModifier += assumption.parameter_value;
        }
      }
    }

    const totalAffected = Math.max(0, affectedCapacity + assumptionModifier);
    const availableSupply = Math.max(0, baseCapacity - totalAffected);
    const shortfall = Math.max(0, totalAffected);

    const result: SimulationResult = {
      available_supply: availableSupply,
      affected_capacity: totalAffected,
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
