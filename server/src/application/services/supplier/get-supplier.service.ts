import { SupplierRepository } from '../../../repositories/interfaces/supplier.repository.js';
import { Supplier } from '../../../domain/entities/index.js';

export interface GetSupplierInput {
  id: string;
}

export class GetSupplierService {
  constructor(private supplierRepository: SupplierRepository) {}

  async execute(input: GetSupplierInput): Promise<Supplier | null> {
    return this.supplierRepository.findById(input.id);
  }
}
