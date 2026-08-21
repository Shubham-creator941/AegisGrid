import { Request, Response, NextFunction } from 'express';
import { CreateEvidenceService } from '../../application/services/evidence/create-evidence.service.js';
import { ListEvidenceService } from '../../application/services/evidence/list-evidence.service.js';

export class EvidenceController {
  constructor(
    private createEvidenceService: CreateEvidenceService,
    private listEvidenceService: ListEvidenceService
  ) {}

  createEvidence = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      const { source_type, source_name, source_reference, content, published_at, retrieved_at, confidence } = req.body;

      if (!eventId || !source_type || !source_name || !source_reference || !content || !published_at || !retrieved_at || confidence === undefined) {
        return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
      }

      const evidence = await this.createEvidenceService.execute({
        event_id: eventId,
        source_type,
        source_name,
        source_reference,
        content,
        published_at: new Date(published_at),
        retrieved_at: new Date(retrieved_at),
        confidence
      });
      
      res.status(201).json(evidence);
    } catch (err: any) {
      if (err.message === 'Event not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      next(err);
    }
  };

  listEvidence = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      if (!eventId) {
        return res.status(400).json({ error: 'Bad Request', message: 'Missing event ID' });
      }

      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
      
      const result = await this.listEvidenceService.execute({ event_id: eventId, page, pageSize });
      
      res.status(200).json(result);
    } catch (err: any) {
      if (err.message === 'Event not found') {
        return res.status(404).json({ error: 'Not Found', message: err.message });
      }
      next(err);
    }
  };
}
