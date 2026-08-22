import { Request, Response, NextFunction } from 'express';
import { CreateEventService } from '../../application/services/event/create-event.service.js';
import { GetEventService } from '../../application/services/event/get-event.service.js';
import { ListEventsService } from '../../application/services/event/list-events.service.js';

export class EventController {
  constructor(
    private createEventService: CreateEventService,
    private getEventService: GetEventService,
    private listEventsService: ListEventsService
  ) {}

  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, event_type, severity, affected_region } = req.body;
      if (!title || !description || !event_type || !severity || !affected_region) {
        return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
      }
      
      const event = await this.createEventService.execute({
        title,
        description,
        event_type,
        severity,
        affected_region
      });
      
      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  };

  getEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      if (!eventId) {
        return res.status(400).json({ error: 'Bad Request', message: 'Missing event ID' });
      }

      const event = await this.getEventService.execute({ event_id: eventId as string });
      
      if (!event) {
        return res.status(404).json({ error: 'Not Found', message: 'Event not found' });
      }

      res.status(200).json(event);
    } catch (err) {
      next(err);
    }
  };

  listEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
      
      const result = await this.listEventsService.execute({ page, pageSize });
      
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
