import { BusinessRuleError } from '../errors/index.js';

export class NetworkRules {
  public static validateSupplyFlow(capacity: number, baselineVolume: number): void {
    if (capacity <= 0) {
      throw new BusinessRuleError(
        'DOMAIN_CONSTRAINT_VIOLATION',
        'Supply flow capacity must be strictly positive',
        { field: 'capacity', value: capacity, condition: '> 0' }
      );
    }
    
    if (baselineVolume < 0) {
      throw new BusinessRuleError(
        'DOMAIN_CONSTRAINT_VIOLATION',
        'Supply flow baseline volume cannot be negative',
        { field: 'baseline_volume', value: baselineVolume, condition: '>= 0' }
      );
    }
    
    if (baselineVolume > capacity) {
      throw new BusinessRuleError(
        'DOMAIN_CONSTRAINT_VIOLATION',
        'Supply flow baseline volume cannot exceed capacity',
        { field: 'baseline_volume', value: baselineVolume, condition: '<= capacity', capacity }
      );
    }
  }
}
