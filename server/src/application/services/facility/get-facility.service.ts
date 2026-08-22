import { FacilityRepository } from '../../../repositories/interfaces/facility.repository.js';
import { Facility } from '../../../domain/entities/index.js';

export interface GetFacilityInput {
  id: string;
}

export class GetFacilityService {
  constructor(private facilityRepository: FacilityRepository) {}

  async execute(input: GetFacilityInput): Promise<Facility | null> {
    return this.facilityRepository.findById(input.id);
  }
}
