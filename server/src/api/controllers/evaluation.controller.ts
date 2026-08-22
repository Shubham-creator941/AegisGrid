import { Request, Response, NextFunction } from 'express';
import { ScenarioEvaluationService } from '../../application/services/evaluation/scenario-evaluation.service.js';
import { GetEvaluationService } from '../../application/services/evaluation/get-evaluation.service.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class EvaluationController {
  constructor(
    private scenarioEvaluationService: ScenarioEvaluationService,
    private getEvaluationService: GetEvaluationService
  ) {}

  // In-memory idempotency store for MVP since no persistence table exists for it.
  // The gap is reported: Idempotency keys need a database table to survive restarts.
  private idempotencyStore = new Map<string, { requestHash: string, result: any }>();

  evaluateScenario = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const scenarioId = req.params.id as string;
      const idempotencyKey = req.headers['idempotency-key'] as string || req.body.idempotency_key;

      if (idempotencyKey) {
        // Simple hash of the request (just the scenario ID for now)
        const requestHash = scenarioId;
        
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
          return res.status(200).json({ success: true, data: cached.result });
        }
      }

      const result = await this.scenarioEvaluationService.evaluateScenario(scenarioId);
      
      if (idempotencyKey) {
        this.idempotencyStore.set(idempotencyKey, { requestHash: scenarioId, result });
      }

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getEvaluationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const evaluation = await this.getEvaluationService.getEvaluationStatus(id);
      res.status(200).json({ success: true, data: evaluation });
    } catch (err) {
      next(err);
    }
  };

  getEvaluationResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const evaluationId = req.params.id as string;
      const result = await this.getEvaluationService.getEvaluationResult(evaluationId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getEvaluationRecommendation = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const recommendation = await this.getEvaluationService.getRecommendation(id);
      res.status(200).json({ success: true, data: recommendation });
    } catch (err) {
      next(err);
    }
  };
}
