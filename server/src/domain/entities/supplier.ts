import { SupplierType } from '../enums/index.js';

export interface Supplier {
  id: string;
  name: string;
  country: string;
  supplier_type: SupplierType;
  status: string;
  created_at: Date;
  updated_at: Date;
}
