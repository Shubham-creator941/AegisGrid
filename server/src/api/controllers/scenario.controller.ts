import { Request, Response, NextFunction } from 'express';
import { CreateScenarioService } from '../../application/services/scenario/create-scenario.service.js';
import { GetScenarioService } from '../../application/services/scenario/get-scenario.service.js';
import { ListScenariosService } from '../../application/services/scenario/list-scenarios.service.js';

export class ScenarioController {
  constructor(
    private createScenarioService: CreateScenarioService,
    private getScenarioService?: GetScenarioService,
    private listScenariosService?: ListScenariosService
  ) {}

  createScenario = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, event_id } = req.body;
      const created_by = req.user?.id || req.body.created_by;
      
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

  getScenario = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.getScenarioService) throw new Error('Service not configured');
      const id = req.params.id as string;
      const scenario = await this.getScenarioService.execute({ id });
      if (!scenario) {
        return res.status(404).json({ error: 'Not Found', message: 'Scenario not found' });
      }
      res.status(200).json(scenario);
    } catch (err) {
      next(err);
    }
  };

  listScenarios = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!this.listScenariosService) throw new Error('Service not configured');
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.page_size as string, 10) || parseInt(req.query.pageSize as string, 10) || 20;

      const result = await this.listScenariosService.execute({ page, pageSize });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
