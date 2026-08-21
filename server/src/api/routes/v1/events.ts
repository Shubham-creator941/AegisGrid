import { Router } from 'express';
import { EventController } from '../../controllers/event.controller.js';
import { CreateEventService } from '../../../application/services/event/create-event.service.js';
import { GetEventService } from '../../../application/services/event/get-event.service.js';
import { ListEventsService } from '../../../application/services/event/list-events.service.js';
import { PostgresEventRepository } from '../../../repositories/postgres/index.js';
import { db } from '../../../infrastructure/database/query.js';

export const eventsRouter = Router();

// DI Setup
const eventRepo = new PostgresEventRepository(db);
const createEventService = new CreateEventService(eventRepo);
const getEventService = new GetEventService(eventRepo);
const listEventsService = new ListEventsService(eventRepo);
const eventController = new EventController(
  createEventService,
  getEventService,
  listEventsService
);

eventsRouter.post('/', eventController.createEvent);
eventsRouter.get('/:eventId', eventController.getEvent);
eventsRouter.get('/', eventController.listEvents);
