import { Router } from 'express';
import { EventController } from '../../controllers/event.controller.js';
import { EvidenceController } from '../../controllers/evidence.controller.js';
import { CreateEventService } from '../../../application/services/event/create-event.service.js';
import { GetEventService } from '../../../application/services/event/get-event.service.js';
import { ListEventsService } from '../../../application/services/event/list-events.service.js';
import { CreateEvidenceService } from '../../../application/services/evidence/create-evidence.service.js';
import { ListEvidenceService } from '../../../application/services/evidence/list-evidence.service.js';
import { PostgresEventRepository, PostgresEvidenceRepository } from '../../../repositories/postgres/index.js';
import { db } from '../../../infrastructure/database/query.js';

export const eventsRouter = Router();

// DI Setup
const eventRepo = new PostgresEventRepository(db);
const evidenceRepo = new PostgresEvidenceRepository(db);

const createEventService = new CreateEventService(eventRepo);
const getEventService = new GetEventService(eventRepo);
const listEventsService = new ListEventsService(eventRepo);
const eventController = new EventController(
  createEventService,
  getEventService,
  listEventsService
);

const createEvidenceService = new CreateEvidenceService(evidenceRepo, eventRepo);
const listEvidenceService = new ListEvidenceService(evidenceRepo, eventRepo);
const evidenceController = new EvidenceController(createEvidenceService, listEvidenceService);

eventsRouter.post('/', eventController.createEvent);
eventsRouter.get('/:eventId', eventController.getEvent);
eventsRouter.get('/', eventController.listEvents);

eventsRouter.post('/:eventId/evidence', evidenceController.createEvidence);
eventsRouter.get('/:eventId/evidence', evidenceController.listEvidence);
