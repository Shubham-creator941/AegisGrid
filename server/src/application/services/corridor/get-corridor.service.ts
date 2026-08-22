import { CorridorRepository } from '../../../repositories/interfaces/corridor.repository.js';
import { Corridor } from '../../../domain/entities/index.js';

export interface GetCorridorInput {
  id: string;
}

export class GetCorridorService {
  constructor(private corridorRepository: CorridorRepository) {}

  async execute(input: GetCorridorInput): Promise<Corridor | null> {
    return this.corridorRepository.findById(input.id);
  }
}
