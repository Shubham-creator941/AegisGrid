import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { UserRole } from 'shared';
import { EventController } from '../../controllers/event.controller.js';
import { EvidenceController } from '../../controllers/evidence.controller.js';
import { CreateEventService } from '../../../application/services/event/create-event.service.js';
import { GetEventService } from '../../../application/services/event/get-event.service.js';
import { ListEventsService } from '../../../application/services/event/list-events.service.js';
import { CreateEvidenceService } from '../../../application/services/evidence/create-evidence.service.js';
import { ListEvidenceService } from '../../../application/services/evidence/list-evidence.service.js';
import { EventAnalysisService } from '../../../application/services/analysis/event-analysis.service.js';
import { CreateRiskAssessmentService } from '../../../application/services/risk-assessment/create-risk-assessment.service.js';
import { PostgresEventRepository, PostgresEvidenceRepository } from '../../../repositories/postgres/index.js';
import { PostgresAIAnalysisRepository } from '../../../repositories/postgres/postgres-ai-analysis.repository.js';
import { PostgresRiskAssessmentRepository } from '../../../repositories/postgres/postgres-risk-assessment.repository.js';
import { MockAIAdapter } from '../../../infrastructure/ai/mock-ai-adapter.js';
import { PostgresTransactionManager } from '../../../infrastructure/database/postgres-transaction-manager.js';
import { db } from '../../../infrastructure/database/query.js';

export const eventsRouter = Router();

// DI Setup
const eventRepo = new PostgresEventRepository(db);
const evidenceRepo = new PostgresEvidenceRepository(db);
const aiAnalysisRepo = new PostgresAIAnalysisRepository(db);
const riskAssessmentRepo = new PostgresRiskAssessmentRepository(db);

const aiAdapter = new MockAIAdapter('dummy');
const transactionManager = new PostgresTransactionManager();

const createEventService = new CreateEventService(eventRepo);
const getEventService = new GetEventService(eventRepo);
const listEventsService = new ListEventsService(eventRepo);
const eventAnalysisService = new EventAnalysisService(eventRepo, evidenceRepo, aiAnalysisRepo, aiAdapter, transactionManager);
const createRiskAssessmentService = new CreateRiskAssessmentService(riskAssessmentRepo, eventRepo, evidenceRepo, transactionManager);

const eventController = new EventController(
  createEventService,
  getEventService,
  listEventsService,
  eventAnalysisService,
  createRiskAssessmentService
);

const createEvidenceService = new CreateEvidenceService(evidenceRepo, eventRepo);
const listEvidenceService = new ListEvidenceService(evidenceRepo, eventRepo);
const evidenceController = new EvidenceController(createEvidenceService, listEvidenceService);

eventsRouter.use(requireAuth);

eventsRouter.post('/', requireRole([UserRole.ADMIN, UserRole.ANALYST, UserRole.DECISION_MAKER]), eventController.createEvent);
eventsRouter.get('/:eventId', eventController.getEvent);
eventsRouter.get('/', eventController.listEvents);

eventsRouter.post('/:eventId/evidence', requireRole([UserRole.ADMIN, UserRole.ANALYST, UserRole.DECISION_MAKER]), evidenceController.createEvidence);
eventsRouter.get('/:eventId/evidence', evidenceController.listEvidence);

eventsRouter.post('/:eventId/analyze', requireRole([UserRole.ADMIN, UserRole.ANALYST, UserRole.DECISION_MAKER]), eventController.analyzeEvent);
eventsRouter.post('/:eventId/risk-assessments', requireRole([UserRole.ADMIN, UserRole.ANALYST, UserRole.DECISION_MAKER]), eventController.createRiskAssessment);
