import { SupplierRepository } from '../../../repositories/interfaces/supplier.repository.js';
import { Supplier } from '../../../domain/entities/index.js';
import { BusinessRuleError } from '../../../domain/errors/index.js';
import { SupplierType } from '../../../domain/enums/index.js';

export interface UpdateSupplierInput {
  id: string;
  name?: string;
  country?: string;
  supplier_type?: SupplierType;
  status?: string;
}

export class UpdateSupplierService {
  constructor(private supplierRepository: SupplierRepository) {}

  async execute(input: UpdateSupplierInput): Promise<Supplier> {
    const existing = await this.supplierRepository.findById(input.id);
    if (!existing) {
      throw new BusinessRuleError('SUPPLIER_NOT_FOUND', 'Supplier not found');
    }

    if (input.supplier_type && !Object.values(SupplierType).includes(input.supplier_type)) {
      throw new BusinessRuleError('SUPPLIER_TYPE_INVALID', `Invalid supplier type: ${input.supplier_type}`);
    }

    if (input.name && input.name !== existing.name) {
      const duplicate = await this.supplierRepository.findByName(input.name);
      if (duplicate) {
        throw new BusinessRuleError('SUPPLIER_DUPLICATE', `Supplier with name '${input.name}' already exists`);
      }
    }

    const updatePayload: Partial<Supplier> = {};
    if (input.name !== undefined) updatePayload.name = input.name;
    if (input.country !== undefined) updatePayload.country = input.country;
    if (input.supplier_type !== undefined) updatePayload.supplier_type = input.supplier_type;
    if (input.status !== undefined) updatePayload.status = input.status;

    const updated = await this.supplierRepository.update(input.id, updatePayload);
    if (!updated) {
      throw new BusinessRuleError('SUPPLIER_UPDATE_FAILED', 'Failed to update supplier');
    }

    return updated;
  }
}
