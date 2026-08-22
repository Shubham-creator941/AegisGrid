import { CorridorRepository } from '../../../repositories/interfaces/corridor.repository.js';
import { Corridor } from '../../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ListCorridorsInput {
  page: number;
  pageSize: number;
  status?: string;
}

export class ListCorridorsService {
  constructor(private corridorRepository: CorridorRepository) {}

  async execute(input: ListCorridorsInput): Promise<PaginatedResult<Corridor>> {
    return this.corridorRepository.list(input.page, input.pageSize, input.status);
  }
}
