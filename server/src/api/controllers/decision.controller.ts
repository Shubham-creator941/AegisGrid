import { Request, Response, NextFunction } from 'express';
import { MakeDecisionApplicationService } from '../../application/services/decision/make-decision.service.js';
import { GetDecisionApplicationService } from '../../application/services/decision/get-decision.service.js';

export class DecisionController {
  // In-memory idempotency store for MVP since no persistence table exists for it.
  // The gap is reported: Idempotency keys need a database table to survive restarts.
  private idempotencyStore = new Map<string, { requestHash: string, result: any }>();

  constructor(
    private makeDecisionService: MakeDecisionApplicationService,
    private getDecisionService: GetDecisionApplicationService
  ) {}

  makeDecision = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recommendation_id = req.params.id || req.body.recommendation_id;
      // Map API request body to the internal input format
      const { decision, selected_response_id, rationale } = req.body;
      const decided_by = req.user?.id;

      if (!recommendation_id || !decision || !decided_by) {
        return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
      }

      const idempotencyKey = req.headers['idempotency-key'] as string || req.body.idempotency_key;

      if (idempotencyKey) {
        // Simple hash of the request 
        const requestHash = `${recommendation_id}-${decision}-${selected_response_id}-${rationale}`;
        
        if (this.idempotencyStore.has(idempotencyKey)) {
          const cached = this.idempotencyStore.get(idempotencyKey)!;
          if (cached.requestHash !== requestHash) {
            return res.status(409).json({
              success: false,
              error: {
                code: 'IDEMPOTENCY_KEY_REUSED',
                message: 'Idempotency key reused with a different request.'
              }
            });
          }
          return res.status(200).json(cached.result);
        }
      }

      const createdDecision = await this.makeDecisionService.execute({
        recommendation_id,
        decision_type: decision,
        selected_response_id,
        reason: rationale,
        decided_by
      });
      
      const result = { success: true, data: createdDecision };

      if (idempotencyKey) {
        this.idempotencyStore.set(idempotencyKey, { requestHash: `${recommendation_id}-${decision}-${selected_response_id}-${rationale}`, result });
      }

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  getDecision = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recommendationId = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
      const result = await this.getDecisionService.execute(recommendationId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
