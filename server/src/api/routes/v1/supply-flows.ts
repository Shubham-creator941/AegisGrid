import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { UserRole } from 'shared';
import { SupplyFlowController } from '../../controllers/supply-flow.controller.js';
import { CreateSupplyFlowService } from '../../../application/services/supply-flow/create-supply-flow.service.js';
import { GetSupplyFlowService } from '../../../application/services/supply-flow/get-supply-flow.service.js';
import { ListSupplyFlowsService } from '../../../application/services/supply-flow/list-supply-flows.service.js';
import { UpdateSupplyFlowService } from '../../../application/services/supply-flow/update-supply-flow.service.js';
import { PostgresSupplyFlowRepository } from '../../../repositories/postgres/postgres-supply-flow.repository.js';
import { PostgresSupplierRepository } from '../../../repositories/postgres/postgres-supplier.repository.js';
import { PostgresFacilityRepository } from '../../../repositories/postgres/postgres-facility.repository.js';
import { PostgresCorridorRepository } from '../../../repositories/postgres/postgres-corridor.repository.js';
import { db } from '../../../infrastructure/database/query.js';

export const supplyFlowsRouter = Router();

const supplyFlowRepo = new PostgresSupplyFlowRepository(db);
const supplierRepo = new PostgresSupplierRepository(db);
const facilityRepo = new PostgresFacilityRepository(db);
const corridorRepo = new PostgresCorridorRepository(db);

const createService = new CreateSupplyFlowService(supplyFlowRepo, supplierRepo, facilityRepo, corridorRepo);
const getService = new GetSupplyFlowService(supplyFlowRepo);
const listService = new ListSupplyFlowsService(supplyFlowRepo);
const updateService = new UpdateSupplyFlowService(supplyFlowRepo, supplierRepo, facilityRepo, corridorRepo);

const controller = new SupplyFlowController(createService, getService, listService, updateService);

supplyFlowsRouter.use(requireAuth);

supplyFlowsRouter.post('/', requireRole([UserRole.ADMIN]), controller.createSupplyFlow);
supplyFlowsRouter.get('/', controller.listSupplyFlows);
supplyFlowsRouter.get('/:id', controller.getSupplyFlow);
supplyFlowsRouter.patch('/:id', requireRole([UserRole.ADMIN]), controller.updateSupplyFlow);
