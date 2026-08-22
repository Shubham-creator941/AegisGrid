import { Request, Response, NextFunction } from 'express';
import { CreateCorridorService } from '../../application/services/corridor/create-corridor.service.js';
import { GetCorridorService } from '../../application/services/corridor/get-corridor.service.js';
import { ListCorridorsService } from '../../application/services/corridor/list-corridors.service.js';
import { UpdateCorridorService } from '../../application/services/corridor/update-corridor.service.js';

export class CorridorController {
  constructor(
    private createCorridorService: CreateCorridorService,
    private getCorridorService: GetCorridorService,
    private listCorridorsService: ListCorridorsService,
    private updateCorridorService: UpdateCorridorService
  ) {}

  createCorridor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, corridor_type, origin, destination, capacity } = req.body;
      const corridor = await this.createCorridorService.execute({
        name,
        corridor_type,
        origin,
        destination,
        capacity
      });
      res.status(201).json(corridor);
    } catch (err) {
      next(err);
    }
  };

  getCorridor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const corridor = await this.getCorridorService.execute({ id });
      if (!corridor) {
        return res.status(404).json({ error: 'Not Found', message: 'Corridor not found' });
      }
      res.status(200).json(corridor);
    } catch (err) {
      next(err);
    }
  };

  listCorridors = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.page_size as string, 10) || parseInt(req.query.pageSize as string, 10) || 20;
      const status = req.query.status as string | undefined;

      const result = await this.listCorridorsService.execute({ page, pageSize, status });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  updateCorridor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { name, corridor_type, origin, destination, capacity, status } = req.body;
      const corridor = await this.updateCorridorService.execute({
        id,
        name,
        corridor_type,
        origin,
        destination,
        capacity,
        status
      });
      res.status(200).json(corridor);
    } catch (err) {
      next(err);
    }
  };
}
