import { Request, Response, NextFunction } from 'express';
import { CreateSupplyFlowService } from '../../application/services/supply-flow/create-supply-flow.service.js';
import { GetSupplyFlowService } from '../../application/services/supply-flow/get-supply-flow.service.js';
import { ListSupplyFlowsService } from '../../application/services/supply-flow/list-supply-flows.service.js';
import { UpdateSupplyFlowService } from '../../application/services/supply-flow/update-supply-flow.service.js';

export class SupplyFlowController {
  constructor(
    private createSupplyFlowService: CreateSupplyFlowService,
    private getSupplyFlowService: GetSupplyFlowService,
    private listSupplyFlowsService: ListSupplyFlowsService,
    private updateSupplyFlowService: UpdateSupplyFlowService
  ) {}

  createSupplyFlow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        supplier_id,
        origin_facility_id,
        destination_facility_id,
        corridor_id,
        commodity,
        capacity,
        baseline_volume
      } = req.body;
      
      const supplyFlow = await this.createSupplyFlowService.execute({
        supplier_id,
        origin_facility_id,
        destination_facility_id,
        corridor_id,
        commodity,
        capacity,
        baseline_volume
      });
      res.status(201).json(supplyFlow);
    } catch (err) {
      next(err);
    }
  };

  getSupplyFlow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const supplyFlow = await this.getSupplyFlowService.execute({ id });
      if (!supplyFlow) {
        return res.status(404).json({ error: 'Not Found', message: 'Supply flow not found' });
      }
      res.status(200).json(supplyFlow);
    } catch (err) {
      next(err);
    }
  };

  listSupplyFlows = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.page_size as string, 10) || parseInt(req.query.pageSize as string, 10) || 20;

      const result = await this.listSupplyFlowsService.execute({ page, pageSize });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  updateSupplyFlow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const {
        supplier_id,
        origin_facility_id,
        destination_facility_id,
        corridor_id,
        commodity,
        capacity,
        baseline_volume,
        status
      } = req.body;
      
      const supplyFlow = await this.updateSupplyFlowService.execute({
        id,
        supplier_id,
        origin_facility_id,
        destination_facility_id,
        corridor_id,
        commodity,
        capacity,
        baseline_volume,
        status
      });
      res.status(200).json(supplyFlow);
    } catch (err) {
      next(err);
    }
  };
}
