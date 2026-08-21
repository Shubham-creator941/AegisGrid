import { Router } from 'express';
import { EventController } from '../../controllers/event.controller.js';
import { CreateEventService } from '../../../application/services/event/create-event.service.js';
import { PostgresEventRepository } from '../../../repositories/postgres/index.js';
import { db } from '../../../infrastructure/database/query.js';

export const eventsRouter = Router();

// DI Setup
const eventRepo = new PostgresEventRepository(db);
const createEventService = new CreateEventService(eventRepo);
const eventController = new EventController(createEventService);

eventsRouter.post('/', eventController.createEvent);
