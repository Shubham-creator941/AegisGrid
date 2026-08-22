import { FacilityRepository } from '../../../repositories/interfaces/facility.repository.js';
import { Facility } from '../../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ListFacilitiesInput {
  page: number;
  pageSize: number;
  status?: string;
}

export class ListFacilitiesService {
  constructor(private facilityRepository: FacilityRepository) {}

  async execute(input: ListFacilitiesInput): Promise<PaginatedResult<Facility>> {
    return this.facilityRepository.list(input.page, input.pageSize, input.status);
  }
}
