import { CorridorRepository } from '../../../repositories/interfaces/corridor.repository.js';
import { Corridor } from '../../../domain/entities/index.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

export interface UpdateCorridorInput {
  id: string;
  name?: string;
  corridor_type?: string;
  origin?: string;
  destination?: string;
  capacity?: number;
  status?: string;
}

export class UpdateCorridorService {
  constructor(private corridorRepository: CorridorRepository) {}

  async execute(input: UpdateCorridorInput): Promise<Corridor> {
    const existing = await this.corridorRepository.findById(input.id);
    if (!existing) {
      throw new BusinessRuleError('CORRIDOR_NOT_FOUND', 'Corridor not found');
    }

    if (input.name && input.name !== existing.name) {
      const duplicate = await this.corridorRepository.findByName(input.name);
      if (duplicate) {
        throw new BusinessRuleError('CORRIDOR_DUPLICATE', 'Corridor with this name already exists');
      }
    }
    
    if (input.capacity !== undefined && input.capacity < 0) {
      throw new BusinessRuleError('CORRIDOR_CAPACITY_INVALID', 'Corridor capacity cannot be negative');
    }

    const updateData: Partial<Corridor> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.corridor_type !== undefined) updateData.corridor_type = input.corridor_type;
    if (input.origin !== undefined) updateData.origin = input.origin;
    if (input.destination !== undefined) updateData.destination = input.destination;
    if (input.capacity !== undefined) updateData.capacity = input.capacity;
    if (input.status !== undefined) updateData.status = input.status;

    const updated = await this.corridorRepository.update(input.id, updateData);
    if (!updated) {
      throw new BusinessRuleError('CORRIDOR_UPDATE_FAILED', 'Failed to update corridor');
    }

    return updated;
  }
}
