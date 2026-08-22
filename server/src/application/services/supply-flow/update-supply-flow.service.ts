import { SupplyFlowRepository } from '../../../repositories/interfaces/supply-flow.repository.js';
import { SupplierRepository } from '../../../repositories/interfaces/supplier.repository.js';
import { FacilityRepository } from '../../../repositories/interfaces/facility.repository.js';
import { CorridorRepository } from '../../../repositories/interfaces/corridor.repository.js';
import { SupplyFlow } from '../../../domain/entities/index.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

export interface UpdateSupplyFlowInput {
  id: string;
  supplier_id?: string;
  origin_facility_id?: string;
  destination_facility_id?: string;
  corridor_id?: string;
  commodity?: string;
  capacity?: number;
  baseline_volume?: number;
  status?: string;
}

export class UpdateSupplyFlowService {
  constructor(
    private supplyFlowRepository: SupplyFlowRepository,
    private supplierRepository: SupplierRepository,
    private facilityRepository: FacilityRepository,
    private corridorRepository: CorridorRepository
  ) {}

  async execute(input: UpdateSupplyFlowInput): Promise<SupplyFlow> {
    const existing = await this.supplyFlowRepository.findById(input.id);
    if (!existing) {
      throw new BusinessRuleError('SUPPLY_FLOW_NOT_FOUND', 'Supply flow not found');
    }

    const newCapacity = input.capacity !== undefined ? input.capacity : existing.capacity;
    const newBaseline = input.baseline_volume !== undefined ? input.baseline_volume : existing.baseline_volume;

    if (newBaseline < 0) {
      throw new BusinessRuleError('INVALID_BASELINE_VOLUME', 'baseline_volume must be >= 0');
    }
    if (newCapacity <= 0) {
      throw new BusinessRuleError('INVALID_CAPACITY', 'capacity must be > 0');
    }
    if (newBaseline > newCapacity) {
      throw new BusinessRuleError('BASELINE_EXCEEDS_CAPACITY', 'baseline_volume cannot exceed capacity');
    }

    if (input.supplier_id) {
      const supplier = await this.supplierRepository.findById(input.supplier_id);
      if (!supplier) throw new BusinessRuleError('SUPPLIER_NOT_FOUND', 'Supplier not found');
      if (supplier.status !== 'ACTIVE') throw new BusinessRuleError('SUPPLIER_NOT_ACTIVE', 'Supplier is not active');
    }

    if (input.origin_facility_id) {
      const originFacility = await this.facilityRepository.findById(input.origin_facility_id);
      if (!originFacility) throw new BusinessRuleError('ORIGIN_FACILITY_NOT_FOUND', 'Origin facility not found');
      if (originFacility.status !== 'ACTIVE') throw new BusinessRuleError('ORIGIN_FACILITY_NOT_ACTIVE', 'Origin facility is not active');
    }

    if (input.destination_facility_id) {
      const destFacility = await this.facilityRepository.findById(input.destination_facility_id);
      if (!destFacility) throw new BusinessRuleError('DESTINATION_FACILITY_NOT_FOUND', 'Destination facility not found');
      if (destFacility.status !== 'ACTIVE') throw new BusinessRuleError('DESTINATION_FACILITY_NOT_ACTIVE', 'Destination facility is not active');
    }

    if (input.corridor_id) {
      const corridor = await this.corridorRepository.findById(input.corridor_id);
      if (!corridor) throw new BusinessRuleError('CORRIDOR_NOT_FOUND', 'Corridor not found');
      if (corridor.status !== 'ACTIVE') throw new BusinessRuleError('CORRIDOR_NOT_ACTIVE', 'Corridor is not active');
    }

    const updateData: Partial<SupplyFlow> = {};
    if (input.supplier_id !== undefined) updateData.supplier_id = input.supplier_id;
    if (input.origin_facility_id !== undefined) updateData.origin_facility_id = input.origin_facility_id;
    if (input.destination_facility_id !== undefined) updateData.destination_facility_id = input.destination_facility_id;
    if (input.corridor_id !== undefined) updateData.corridor_id = input.corridor_id;
    if (input.commodity !== undefined) updateData.commodity = input.commodity;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.baseline_volume !== undefined) updateData.baseline_volume = input.baseline_volume;
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await this.supplyFlowRepository.update(input.id, updateData);
    if (!updated) {
      throw new BusinessRuleError('SUPPLY_FLOW_UPDATE_FAILED', 'Failed to update supply flow');
    }

    return updated;
  }
}
