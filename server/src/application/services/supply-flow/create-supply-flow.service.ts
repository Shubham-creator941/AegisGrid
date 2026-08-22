import { SupplyFlowRepository } from '../../../repositories/interfaces/supply-flow.repository.js';
import { SupplierRepository } from '../../../repositories/interfaces/supplier.repository.js';
import { FacilityRepository } from '../../../repositories/interfaces/facility.repository.js';
import { CorridorRepository } from '../../../repositories/interfaces/corridor.repository.js';
import { SupplyFlow } from '../../../domain/entities/index.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

export interface CreateSupplyFlowInput {
  supplier_id: string;
  origin_facility_id: string;
  destination_facility_id: string;
  corridor_id: string;
  commodity: string;
  capacity: number;
  baseline_volume: number;
}

export class CreateSupplyFlowService {
  constructor(
    private supplyFlowRepository: SupplyFlowRepository,
    private supplierRepository: SupplierRepository,
    private facilityRepository: FacilityRepository,
    private corridorRepository: CorridorRepository
  ) {}

  async execute(input: CreateSupplyFlowInput): Promise<SupplyFlow> {
    if (input.baseline_volume < 0) {
      throw new BusinessRuleError('INVALID_BASELINE_VOLUME', 'baseline_volume must be >= 0');
    }
    if (input.capacity <= 0) {
      throw new BusinessRuleError('INVALID_CAPACITY', 'capacity must be > 0');
    }
    if (input.baseline_volume > input.capacity) {
      throw new BusinessRuleError('BASELINE_EXCEEDS_CAPACITY', 'baseline_volume cannot exceed capacity');
    }

    const supplier = await this.supplierRepository.findById(input.supplier_id);
    if (!supplier) throw new BusinessRuleError('SUPPLIER_NOT_FOUND', 'Supplier not found');
    if (supplier.status !== 'ACTIVE') throw new BusinessRuleError('SUPPLIER_NOT_ACTIVE', 'Supplier is not active');

    const originFacility = await this.facilityRepository.findById(input.origin_facility_id);
    if (!originFacility) throw new BusinessRuleError('ORIGIN_FACILITY_NOT_FOUND', 'Origin facility not found');
    if (originFacility.status !== 'ACTIVE') throw new BusinessRuleError('ORIGIN_FACILITY_NOT_ACTIVE', 'Origin facility is not active');

    const destFacility = await this.facilityRepository.findById(input.destination_facility_id);
    if (!destFacility) throw new BusinessRuleError('DESTINATION_FACILITY_NOT_FOUND', 'Destination facility not found');
    if (destFacility.status !== 'ACTIVE') throw new BusinessRuleError('DESTINATION_FACILITY_NOT_ACTIVE', 'Destination facility is not active');

    const corridor = await this.corridorRepository.findById(input.corridor_id);
    if (!corridor) throw new BusinessRuleError('CORRIDOR_NOT_FOUND', 'Corridor not found');
    if (corridor.status !== 'ACTIVE') throw new BusinessRuleError('CORRIDOR_NOT_ACTIVE', 'Corridor is not active');

    const entity: Omit<SupplyFlow, 'id' | 'created_at' | 'updated_at'> = {
      ...input,
      status: 'ACTIVE'
    };

    return this.supplyFlowRepository.create(entity);
  }
}
