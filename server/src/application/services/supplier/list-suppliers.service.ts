import { SupplierRepository } from '../../../repositories/interfaces/supplier.repository.js';
import { Supplier } from '../../../domain/entities/index.js';
import { PaginatedResult } from 'shared';

export interface ListSuppliersInput {
  page: number;
  pageSize: number;
  status?: string;
}

export class ListSuppliersService {
  constructor(private supplierRepository: SupplierRepository) {}

  async execute(input: ListSuppliersInput): Promise<PaginatedResult<Supplier>> {
    const page = Math.max(1, input.page);
    const pageSize = Math.min(100, Math.max(1, input.pageSize));
    return this.supplierRepository.list(page, pageSize, input.status);
  }
}
