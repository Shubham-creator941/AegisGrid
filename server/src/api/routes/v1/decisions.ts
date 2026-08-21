import { Router } from 'express';
import { DecisionController } from '../../controllers/decision.controller.js';
import { MakeDecisionApplicationService } from '../../../application/services/decision/make-decision.service.js';
import { PostgresDecisionRepository, PostgresRecommendationRepository } from '../../../repositories/postgres/index.js';
import { PostgresTransactionManager } from '../../../repositories/postgres/postgres-transaction-manager.js';
import { db } from '../../../infrastructure/database/query.js';

export const decisionsRouter = Router();

// DI Setup
const decisionRepo = new PostgresDecisionRepository(db);
const recommendationRepo = new PostgresRecommendationRepository(db);
const transactionManager = new PostgresTransactionManager();
const makeDecisionService = new MakeDecisionApplicationService(decisionRepo, recommendationRepo, transactionManager);
const decisionController = new DecisionController(makeDecisionService);

decisionsRouter.post('/', decisionController.makeDecision);

// Mount point will typically be /recommendations/:recommendationId/decisions or /decisions
