import { FacilityRepository } from '../../../repositories/interfaces/facility.repository.js';
import { Facility } from '../../../domain/entities/index.js';
import { FacilityType } from '../../../domain/enums/index.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

export interface UpdateFacilityInput {
  id: string;
  name?: string;
  facility_type?: FacilityType;
  country?: string;
  region?: string;
  capacity?: number;
  status?: string;
}

export class UpdateFacilityService {
  constructor(private facilityRepository: FacilityRepository) {}

  async execute(input: UpdateFacilityInput): Promise<Facility> {
    const existing = await this.facilityRepository.findById(input.id);
    if (!existing) {
      throw new BusinessRuleError('FACILITY_NOT_FOUND', 'Facility not found');
    }

    if (input.name && input.name !== existing.name) {
      const duplicate = await this.facilityRepository.findByName(input.name);
      if (duplicate) {
        throw new BusinessRuleError('FACILITY_DUPLICATE', 'Facility with this name already exists');
      }
    }
    
    if (input.capacity !== undefined && input.capacity < 0) {
      throw new BusinessRuleError('FACILITY_CAPACITY_INVALID', 'Facility capacity cannot be negative');
    }

    const updateData: Partial<Facility> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.facility_type !== undefined) updateData.facility_type = input.facility_type;
    if (input.country !== undefined) updateData.country = input.country;
    if (input.region !== undefined) updateData.region = input.region;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await this.facilityRepository.update(input.id, updateData);
    if (!updated) {
      throw new BusinessRuleError('FACILITY_UPDATE_FAILED', 'Failed to update facility');
    }

    return updated;
  }
}
