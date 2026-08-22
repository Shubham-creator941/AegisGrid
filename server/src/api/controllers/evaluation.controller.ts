import { Request, Response, NextFunction } from 'express';
import { ScenarioEvaluationService } from '../../application/services/evaluation/scenario-evaluation.service.js';
import { GetEvaluationService } from '../../application/services/evaluation/get-evaluation.service.js';
import { BusinessRuleError } from '../../domain/errors/index.js';

export class EvaluationController {
  constructor(
    private scenarioEvaluationService: ScenarioEvaluationService,
    private getEvaluationService: GetEvaluationService
  ) {}

  evaluateScenario = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const scenarioId = req.params.id as string;
      const result = await this.scenarioEvaluationService.evaluateScenario(scenarioId);
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
