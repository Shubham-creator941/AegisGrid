import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { UserRole } from 'shared';
import { SupplierController } from '../../controllers/supplier.controller.js';
import { CreateSupplierService } from '../../../application/services/supplier/create-supplier.service.js';
import { GetSupplierService } from '../../../application/services/supplier/get-supplier.service.js';
import { ListSuppliersService } from '../../../application/services/supplier/list-suppliers.service.js';
import { UpdateSupplierService } from '../../../application/services/supplier/update-supplier.service.js';
import { PostgresSupplierRepository } from '../../../repositories/postgres/index.js';
import { db } from '../../../infrastructure/database/query.js';

export const suppliersRouter = Router();

// DI Setup
const supplierRepo = new PostgresSupplierRepository(db);

const createSupplierService = new CreateSupplierService(supplierRepo);
const getSupplierService = new GetSupplierService(supplierRepo);
const listSuppliersService = new ListSuppliersService(supplierRepo);
const updateSupplierService = new UpdateSupplierService(supplierRepo);

const supplierController = new SupplierController(
  createSupplierService,
  getSupplierService,
  listSuppliersService,
  updateSupplierService
);

// Apply auth middleware to all routes
suppliersRouter.use(requireAuth);

suppliersRouter.get('/', supplierController.listSuppliers);
suppliersRouter.post('/', requireRole([UserRole.ADMIN]), supplierController.createSupplier);
suppliersRouter.get('/:id', supplierController.getSupplier);
suppliersRouter.patch('/:id', requireRole([UserRole.ADMIN]), supplierController.updateSupplier);
