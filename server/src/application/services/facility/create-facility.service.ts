import { FacilityRepository } from '../../../repositories/interfaces/facility.repository.js';
import { Facility } from '../../../domain/entities/index.js';
import { FacilityType } from '../../../domain/enums/index.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

export interface CreateFacilityInput {
  name: string;
  facility_type: FacilityType;
  country: string;
  region: string;
  capacity: number;
}

export class CreateFacilityService {
  constructor(private facilityRepository: FacilityRepository) {}

  async execute(input: CreateFacilityInput): Promise<Facility> {
    if (!input.name) {
      throw new BusinessRuleError('FACILITY_NAME_REQUIRED', 'Facility name is required');
    }
    if (!input.facility_type) {
      throw new BusinessRuleError('FACILITY_TYPE_REQUIRED', 'Facility type is required');
    }
    if (input.capacity < 0) {
      throw new BusinessRuleError('FACILITY_CAPACITY_INVALID', 'Facility capacity cannot be negative');
    }

    const existing = await this.facilityRepository.findByName(input.name);
    if (existing) {
      throw new BusinessRuleError('FACILITY_DUPLICATE', 'Facility with this name already exists');
    }

    const entity: Omit<Facility, 'id' | 'created_at' | 'updated_at'> = {
      name: input.name,
      facility_type: input.facility_type,
      country: input.country,
      region: input.region,
      capacity: input.capacity,
      status: 'ACTIVE'
    };

    return this.facilityRepository.create(entity);
  }
}
