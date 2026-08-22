import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { UserRole } from 'shared';
import { CorridorController } from '../../controllers/corridor.controller.js';
import { CreateCorridorService } from '../../../application/services/corridor/create-corridor.service.js';
import { GetCorridorService } from '../../../application/services/corridor/get-corridor.service.js';
import { ListCorridorsService } from '../../../application/services/corridor/list-corridors.service.js';
import { UpdateCorridorService } from '../../../application/services/corridor/update-corridor.service.js';
import { PostgresCorridorRepository } from '../../../repositories/postgres/postgres-corridor.repository.js';
import { db } from '../../../infrastructure/database/query.js';

export const corridorsRouter = Router();

const repository = new PostgresCorridorRepository(db);
const createService = new CreateCorridorService(repository);
const getService = new GetCorridorService(repository);
const listService = new ListCorridorsService(repository);
const updateService = new UpdateCorridorService(repository);

const controller = new CorridorController(createService, getService, listService, updateService);

corridorsRouter.use(requireAuth);

corridorsRouter.post('/', requireRole(UserRole.ADMIN), controller.createCorridor);
corridorsRouter.get('/', controller.listCorridors);
corridorsRouter.get('/:id', controller.getCorridor);
corridorsRouter.patch('/:id', requireRole(UserRole.ADMIN), controller.updateCorridor);
