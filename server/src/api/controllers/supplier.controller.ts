import { Request, Response, NextFunction } from 'express';
import { CreateSupplierService } from '../../application/services/supplier/create-supplier.service.js';
import { GetSupplierService } from '../../application/services/supplier/get-supplier.service.js';
import { ListSuppliersService } from '../../application/services/supplier/list-suppliers.service.js';
import { UpdateSupplierService } from '../../application/services/supplier/update-supplier.service.js';

export class SupplierController {
  constructor(
    private createSupplierService: CreateSupplierService,
    private getSupplierService: GetSupplierService,
    private listSuppliersService: ListSuppliersService,
    private updateSupplierService: UpdateSupplierService
  ) {}

  createSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, country, supplier_type } = req.body;
      const supplier = await this.createSupplierService.execute({
        name,
        country,
        supplier_type
      });
      res.status(201).json(supplier);
    } catch (err) {
      next(err);
    }
  };

  getSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const supplier = await this.getSupplierService.execute({ id: id as string });
      if (!supplier) {
        return res.status(404).json({ error: 'Not Found', message: 'Supplier not found' });
      }
      res.status(200).json(supplier);
    } catch (err) {
      next(err);
    }
  };

  listSuppliers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.page_size as string, 10) || parseInt(req.query.pageSize as string, 10) || 20;
      const status = req.query.status as string | undefined;

      const result = await this.listSuppliersService.execute({ page, pageSize, status });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, country, supplier_type, status } = req.body;
      const supplier = await this.updateSupplierService.execute({
        id: id as string,
        name,
        country,
        supplier_type,
        status
      });
      res.status(200).json(supplier);
    } catch (err) {
      next(err);
    }
  };
}
