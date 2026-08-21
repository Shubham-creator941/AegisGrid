import { Request, Response, NextFunction } from 'express';
import { CreateScenarioService } from '../../application/services/scenario/create-scenario.service.js';

export class ScenarioController {
  constructor(private createScenarioService: CreateScenarioService) {}

  createScenario = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, event_id, created_by } = req.body;
      if (!name || !description || !event_id || !created_by) {
        return res.status(400).json({ error: 'Bad Request', message: 'Missing required fields' });
      }

      const scenario = await this.createScenarioService.execute({
        name,
        description,
        event_id,
        created_by
      });
      
      res.status(201).json(scenario);
    } catch (err) {
      next(err);
    }
  };
}
