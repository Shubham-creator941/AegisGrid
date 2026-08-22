import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { UserRole } from 'shared';
import { ScenarioController } from '../../controllers/scenario.controller.js';
import { CreateScenarioService } from '../../../application/services/scenario/create-scenario.service.js';
import { GetScenarioService } from '../../../application/services/scenario/get-scenario.service.js';
import { ListScenariosService } from '../../../application/services/scenario/list-scenarios.service.js';
import { PostgresScenarioRepository, PostgresEventRepository } from '../../../repositories/postgres/index.js';
import { db } from '../../../infrastructure/database/query.js';
import { evaluateScenarioHandler } from './evaluations.js';

export const scenariosRouter = Router();

// DI Setup
const scenarioRepo = new PostgresScenarioRepository(db);
const eventRepo = new PostgresEventRepository(db);
const createScenarioService = new CreateScenarioService(scenarioRepo, eventRepo);
const getScenarioService = new GetScenarioService(scenarioRepo);
const listScenariosService = new ListScenariosService(scenarioRepo);
const scenarioController = new ScenarioController(
  createScenarioService,
  getScenarioService,
  listScenariosService
);

scenariosRouter.use(requireAuth);

scenariosRouter.post('/', requireRole([UserRole.ADMIN, UserRole.ANALYST, UserRole.DECISION_MAKER]), scenarioController.createScenario);
scenariosRouter.get('/', scenarioController.listScenarios);
scenariosRouter.get('/:id', scenarioController.getScenario);
scenariosRouter.post('/:id/evaluate', requireRole([UserRole.ADMIN, UserRole.ANALYST, UserRole.DECISION_MAKER]), evaluateScenarioHandler);
