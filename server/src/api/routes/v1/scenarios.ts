import { Router } from 'express';
import { ScenarioController } from '../../controllers/scenario.controller.js';
import { CreateScenarioService } from '../../../application/services/scenario/create-scenario.service.js';
import { PostgresScenarioRepository, PostgresEventRepository } from '../../../repositories/postgres/index.js';
import { db } from '../../../infrastructure/database/query.js';

export const scenariosRouter = Router();

// DI Setup
const scenarioRepo = new PostgresScenarioRepository(db);
const eventRepo = new PostgresEventRepository(db);
const createScenarioService = new CreateScenarioService(scenarioRepo, eventRepo);
const scenarioController = new ScenarioController(createScenarioService);

scenariosRouter.post('/', scenarioController.createScenario);
