import { Request, Response, NextFunction } from 'express';
import { CreateEventService } from '../../application/services/event/create-event.service.js';

export class EventController {
  constructor(private createEventService: CreateEventService) {}

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
}
