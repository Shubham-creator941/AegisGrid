import { Request, Response, NextFunction } from 'express';
import { CreateEventService } from '../../application/services/event/create-event.service.js';
import { GetEventService } from '../../application/services/event/get-event.service.js';
import { ListEventsService } from '../../application/services/event/list-events.service.js';
import { EventAnalysisService } from '../../application/services/analysis/event-analysis.service.js';
import { CreateRiskAssessmentService } from '../../application/services/risk-assessment/create-risk-assessment.service.js';

export class EventController {
  constructor(
    private createEventService: CreateEventService,
    private getEventService: GetEventService,
    private listEventsService: ListEventsService,
    private eventAnalysisService?: EventAnalysisService,
    private createRiskAssessmentService?: CreateRiskAssessmentService
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

  analyzeEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.eventAnalysisService) throw new Error('Service not configured');
      const eventId = (req.params.eventId || req.params.id) as string;
      const analysis = await this.eventAnalysisService.analyzeEvent(eventId);
      res.status(200).json(analysis);
    } catch (err) {
      next(err);
    }
  };

  getAnalysis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.eventAnalysisService) throw new Error('Service not configured');
      const eventId = (req.params.eventId || req.params.id) as string;
      const analysis = await this.eventAnalysisService.getAnalysis(eventId);
      if (!analysis) {
        return res.status(404).json({ error: 'Not Found', message: 'Analysis not found' });
      }
      res.status(200).json(analysis);
    } catch (err) {
      next(err);
    }
  };

  createRiskAssessment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.createRiskAssessmentService) throw new Error('Service not configured');
      const eventId = (req.params.eventId || req.params.id) as string;
      
      const {
        probability,
        severity,
        exposure,
        confidence,
        risk_level,
        assessment_basis
      } = req.body;
      
      const userId = (req as any).user?.id || 'system';

      const assessment = await this.createRiskAssessmentService.execute({
        event_id: eventId,
        probability,
        severity,
        exposure,
        confidence,
        risk_level,
        assessment_basis,
        created_by: userId
      });

      res.status(201).json(assessment);
    } catch (err) {
      next(err);
    }
  };

  getRiskAssessment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.createRiskAssessmentService) throw new Error('Service not configured');
      const eventId = (req.params.eventId || req.params.id) as string;
      const assessment = await this.createRiskAssessmentService.getRiskAssessment(eventId);
      if (!assessment) {
        return res.status(404).json({ error: 'Not Found', message: 'Risk assessment not found' });
      }
      res.status(200).json(assessment);
    } catch (err) {
      next(err);
    }
  };
}
