import { Router } from 'express';
import { UserRole } from 'shared';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { DecisionController } from '../../controllers/decision.controller.js';
import { MakeDecisionApplicationService } from '../../../application/services/decision/make-decision.service.js';
import { 
  PostgresDecisionRepository, 
  PostgresRecommendationRepository,
  PostgresEvaluationRepository,
  PostgresScenarioRepository,
  PostgresAuditLogRepository
} from '../../../repositories/postgres/index.js';
import { PostgresTransactionManager } from '../../../repositories/postgres/postgres-transaction-manager.js';
import { db } from '../../../infrastructure/database/query.js';

export const decisionsRouter = Router();

// DI Setup
const decisionRepo = new PostgresDecisionRepository(db);
const recommendationRepo = new PostgresRecommendationRepository(db);
const evaluationRepo = new PostgresEvaluationRepository(db);
const scenarioRepo = new PostgresScenarioRepository(db);
const auditLogRepo = new PostgresAuditLogRepository(db);
const transactionManager = new PostgresTransactionManager();
const makeDecisionService = new MakeDecisionApplicationService(
  decisionRepo, 
  recommendationRepo, 
  evaluationRepo,
  scenarioRepo,
  auditLogRepo,
  transactionManager
);
const decisionController = new DecisionController(makeDecisionService);

decisionsRouter.use(requireAuth);

decisionsRouter.post('/', requireRole([UserRole.ADMIN, UserRole.DECISION_MAKER]), decisionController.makeDecision);

// Mount point will typically be /recommendations/:recommendationId/decisions or /decisions
