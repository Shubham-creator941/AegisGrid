import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { EvaluationController } from '../../controllers/evaluation.controller.js';
import { GetEvaluationService } from '../../../application/services/evaluation/get-evaluation.service.js';
import { ScenarioEvaluationService } from '../../../application/services/evaluation/scenario-evaluation.service.js';
import { db } from '../../../infrastructure/database/query.js';
import { PostgresTransactionManager } from '../../../repositories/postgres/postgres-transaction-manager.js';
import { EvaluationOrchestrator } from '../../../application/services/evaluation/evaluation-orchestrator.js';
import { DeterministicSimulationEngine } from '../../../engines/simulation/simulation.engine.js';
import { DeterministicImpactEngine } from '../../../engines/impact/impact.engine.js';
import { DeterministicResponseEngine } from '../../../engines/response/response.engine.js';
import { DeterministicConstraintEngine } from '../../../engines/constraint/constraint.engine.js';
import { DeterministicScoringEngine } from '../../../engines/scoring/scoring.engine.js';
import { DeterministicRankingEngine } from '../../../engines/ranking/ranking.engine.js';
import { DeterministicRecommendationEngine } from '../../../engines/recommendation/recommendation.engine.js';
import {
  PostgresEventRepository,
  PostgresScenarioRepository,
  PostgresScenarioAssumptionRepository,
  PostgresAIAnalysisRepository,
  PostgresNetworkRepository,
  PostgresRiskAssessmentRepository,
  PostgresEvaluationRepository,
  PostgresResponseCandidateRepository,
  PostgresConstraintEvaluationRepository,
  PostgresResponseScoreRepository,
  PostgresRecommendationRepository,
  PostgresImpactAssessmentRepository
} from '../../../repositories/postgres/index.js';

export const evaluationsRouter = Router();

// DI Setup
const txManager = new PostgresTransactionManager();

const eventRepo = new PostgresEventRepository(db);
const scenarioRepo = new PostgresScenarioRepository(db);
const assumptionRepo = new PostgresScenarioAssumptionRepository(db);
const aiAnalysisRepo = new PostgresAIAnalysisRepository(db);
const networkRepo = new PostgresNetworkRepository(db);
const riskAssessmentRepo = new PostgresRiskAssessmentRepository(db);
const evaluationRepo = new PostgresEvaluationRepository(db);
const candidateRepo = new PostgresResponseCandidateRepository(db);
const constraintRepo = new PostgresConstraintEvaluationRepository(db);
const scoreRepo = new PostgresResponseScoreRepository(db);
const recommendationRepo = new PostgresRecommendationRepository(db);
const impactRepo = new PostgresImpactAssessmentRepository(db);

const orchestrator = new EvaluationOrchestrator(
  new DeterministicSimulationEngine(),
  new DeterministicImpactEngine(),
  new DeterministicResponseEngine(),
  new DeterministicConstraintEngine(),
  new DeterministicScoringEngine(),
  new DeterministicRankingEngine(),
  new DeterministicRecommendationEngine()
);

const getEvaluationService = new GetEvaluationService(
  evaluationRepo,
  impactRepo, // Wait! I need impactRepo
  candidateRepo,
  constraintRepo,
  scoreRepo,
  recommendationRepo
);

const scenarioEvaluationService = new ScenarioEvaluationService(
  eventRepo,
  scenarioRepo,
  assumptionRepo,
  aiAnalysisRepo,
  networkRepo,
  riskAssessmentRepo,
  evaluationRepo,
  impactRepo,
  candidateRepo,
  constraintRepo,
  scoreRepo,
  recommendationRepo,
  orchestrator,
  txManager
);

const evaluationController = new EvaluationController(
  scenarioEvaluationService,
  getEvaluationService
);

evaluationsRouter.use(requireAuth);

evaluationsRouter.get('/:id', evaluationController.getEvaluationStatus);
evaluationsRouter.get('/:id/result', evaluationController.getEvaluationResult);
evaluationsRouter.get('/:id/recommendation', evaluationController.getEvaluationRecommendation);

// Also need to mount POST /api/v1/scenarios/:id/evaluate but it belongs to scenarios.ts conceptually or can be exported from here to be used in scenarios.ts
export const evaluateScenarioHandler = evaluationController.evaluateScenario;
