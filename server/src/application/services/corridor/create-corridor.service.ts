import { CorridorRepository } from '../../../repositories/interfaces/corridor.repository.js';
import { Corridor } from '../../../domain/entities/index.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

export interface CreateCorridorInput {
  name: string;
  corridor_type: string;
  origin: string;
  destination: string;
  capacity: number;
}

export class CreateCorridorService {
  constructor(private corridorRepository: CorridorRepository) {}

  async execute(input: CreateCorridorInput): Promise<Corridor> {
    if (!input.name) {
      throw new BusinessRuleError('CORRIDOR_NAME_REQUIRED', 'Corridor name is required');
    }
    if (!input.corridor_type) {
      throw new BusinessRuleError('CORRIDOR_TYPE_REQUIRED', 'Corridor type is required');
    }
    if (input.capacity < 0) {
      throw new BusinessRuleError('CORRIDOR_CAPACITY_INVALID', 'Corridor capacity cannot be negative');
    }

    const existing = await this.corridorRepository.findByName(input.name);
    if (existing) {
      throw new BusinessRuleError('CORRIDOR_DUPLICATE', 'Corridor with this name already exists');
    }

    const entity: Omit<Corridor, 'id' | 'created_at' | 'updated_at'> = {
      name: input.name,
      corridor_type: input.corridor_type,
      origin: input.origin,
      destination: input.destination,
      capacity: input.capacity,
      status: 'ACTIVE'
    };

    return this.corridorRepository.create(entity);
  }
}
