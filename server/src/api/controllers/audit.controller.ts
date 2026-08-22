import { Request, Response, NextFunction } from 'express';
import { ListAuditApplicationService } from '../../application/services/audit/list-audit.service.js';

export class AuditController {
  constructor(private listAuditService: ListAuditApplicationService) {}

  listAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 50;

      const filters = {
        actor_id: req.query.actor_id as string | undefined,
        action: req.query.action as string | undefined,
        entity_type: req.query.entity_type as string | undefined,
        entity_id: req.query.entity_id as string | undefined,
      };

      // Clean up undefined filters
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined));

      const result = await this.listAuditService.execute({
        page,
        pageSize,
        filters: Object.keys(activeFilters).length > 0 ? activeFilters : undefined
      });
      
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
