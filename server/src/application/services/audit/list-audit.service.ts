import { AuditLogRepository, AuditLogFilter } from '../../../repositories/interfaces/audit-log.repository.js';
import { AuditLog } from '../../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface ListAuditInput {
  page: number;
  pageSize: number;
  filters?: AuditLogFilter;
}

export class ListAuditApplicationService {
  constructor(private auditLogRepo: AuditLogRepository) {}

  async execute(input: ListAuditInput): Promise<PaginatedResult<AuditLog>> {
    return this.auditLogRepo.list(input.page, input.pageSize, input.filters);
  }
}
