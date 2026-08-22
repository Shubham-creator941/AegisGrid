import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { UserRole } from 'shared';
import { FacilityController } from '../../controllers/facility.controller.js';
import { CreateFacilityService } from '../../../application/services/facility/create-facility.service.js';
import { GetFacilityService } from '../../../application/services/facility/get-facility.service.js';
import { ListFacilitiesService } from '../../../application/services/facility/list-facilities.service.js';
import { UpdateFacilityService } from '../../../application/services/facility/update-facility.service.js';
import { PostgresFacilityRepository } from '../../../repositories/postgres/postgres-facility.repository.js';
import { db } from '../../../infrastructure/database/query.js';

export const facilitiesRouter = Router();

const repository = new PostgresFacilityRepository(db);
const createService = new CreateFacilityService(repository);
const getService = new GetFacilityService(repository);
const listService = new ListFacilitiesService(repository);
const updateService = new UpdateFacilityService(repository);

const controller = new FacilityController(createService, getService, listService, updateService);

facilitiesRouter.use(requireAuth);

facilitiesRouter.post('/', requireRole([UserRole.ADMIN]), controller.createFacility);
facilitiesRouter.get('/', controller.listFacilities);
facilitiesRouter.get('/:id', controller.getFacility);
facilitiesRouter.patch('/:id', requireRole([UserRole.ADMIN]), controller.updateFacility);
