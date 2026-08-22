import { SupplierRepository } from '../../../repositories/interfaces/supplier.repository.js';
import { Supplier } from '../../../domain/entities/index.js';
import { SupplierType } from '../../../domain/enums/index.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';

export interface CreateSupplierInput {
  name: string;
  country: string;
  supplier_type: SupplierType;
}

export class CreateSupplierService {
  constructor(private supplierRepository: SupplierRepository) {}

  async execute(input: CreateSupplierInput): Promise<Supplier> {
    if (!input.name) {
      throw new BusinessRuleError('SUPPLIER_NAME_REQUIRED', 'Supplier name is required');
    }
    if (!input.country) {
      throw new BusinessRuleError('SUPPLIER_COUNTRY_REQUIRED', 'Supplier country is required');
    }
    if (!input.supplier_type) {
      throw new BusinessRuleError('SUPPLIER_TYPE_REQUIRED', 'Supplier type is required');
    }
    if (!Object.values(SupplierType).includes(input.supplier_type)) {
      throw new BusinessRuleError('SUPPLIER_TYPE_INVALID', `Invalid supplier type: ${input.supplier_type}`);
    }

    const existing = await this.supplierRepository.findByName(input.name);
    if (existing) {
      throw new BusinessRuleError('SUPPLIER_DUPLICATE', `Supplier with name '${input.name}' already exists`);
    }

    return this.supplierRepository.create({
      name: input.name,
      country: input.country,
      supplier_type: input.supplier_type,
      status: 'ACTIVE'
    });
  }
}
