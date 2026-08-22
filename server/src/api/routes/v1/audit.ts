import { Router } from 'express';
import { UserRole } from 'shared';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { AuditController } from '../../controllers/audit.controller.js';
import { ListAuditApplicationService } from '../../../application/services/audit/list-audit.service.js';
import { PostgresAuditLogRepository } from '../../../repositories/postgres/index.js';
import { db } from '../../../infrastructure/database/query.js';

export const auditRouter = Router();

// DI Setup
const auditLogRepo = new PostgresAuditLogRepository(db);
const listAuditService = new ListAuditApplicationService(auditLogRepo);
const auditController = new AuditController(listAuditService);

auditRouter.use(requireAuth);

auditRouter.get('/', requireRole([UserRole.ADMIN]), auditController.listAuditLogs);
