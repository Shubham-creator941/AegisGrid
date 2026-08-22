import { Router } from 'express';
import { UserRole } from 'shared';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { DecisionController } from '../../controllers/decision.controller.js';
import { MakeDecisionApplicationService } from '../../../application/services/decision/make-decision.service.js';
import { GetDecisionApplicationService } from '../../../application/services/decision/get-decision.service.js';
import { 
  PostgresDecisionRepository, 
  PostgresRecommendationRepository,
  PostgresEvaluationRepository,
  PostgresScenarioRepository,
  PostgresAuditLogRepository,
  PostgresResponseCandidateRepository,
  PostgresConstraintEvaluationRepository
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
const candidateRepo = new PostgresResponseCandidateRepository(db);
const constraintRepo = new PostgresConstraintEvaluationRepository(db);
const transactionManager = new PostgresTransactionManager();

const makeDecisionService = new MakeDecisionApplicationService(
  decisionRepo, 
  recommendationRepo, 
  evaluationRepo,
  scenarioRepo,
  auditLogRepo,
  candidateRepo,
  constraintRepo,
  transactionManager
);
const getDecisionService = new GetDecisionApplicationService(
  decisionRepo,
  recommendationRepo
);

const decisionController = new DecisionController(makeDecisionService, getDecisionService);

decisionsRouter.use(requireAuth);

// This matches /api/v1/recommendations/:id/decision
// (Assumes mounted on /api/v1/recommendations in the main router, 
// or if mounted globally as /api/v1/decisions, but the contract is POST /api/v1/recommendations/:id/decision)
decisionsRouter.post('/:id/decision', requireRole([UserRole.ADMIN, UserRole.DECISION_MAKER]), decisionController.makeDecision);
decisionsRouter.get('/:id/decision', requireRole([UserRole.ADMIN, UserRole.DECISION_MAKER]), decisionController.getDecision);
