import { Request, Response, NextFunction } from 'express';
import { MakeDecisionApplicationService } from '../../application/services/decision/make-decision.service.js';

export class DecisionController {
  constructor(private makeDecisionService: MakeDecisionApplicationService) {}

  makeDecision = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const recommendation_id = req.params.recommendationId || req.body.recommendation_id;
      const { decision_type, selected_response_id, reason } = req.body;
      const decided_by = req.user?.id || req.body.decided_by;

      if (!recommendation_id || !decision_type || !reason || !decided_by) {
        return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
      }

      const decision = await this.makeDecisionService.execute({
        recommendation_id,
        decision_type,
        selected_response_id,
        reason,
        decided_by
      });
      
      res.status(201).json(decision);
    } catch (err) {
      next(err);
    }
  };
}
