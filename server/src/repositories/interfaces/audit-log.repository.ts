import { AuditLog } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface AuditLogFilter {
  actor_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
}

export interface AuditLogRepository {
  findById(id: string): Promise<AuditLog | null>;
  create(entity: Omit<AuditLog, 'id' | 'created_at' | 'updated_at'>): Promise<AuditLog>;
  update(id: string, entity: Partial<AuditLog>): Promise<AuditLog | null>;
  list(page: number, pageSize: number, filters?: AuditLogFilter): Promise<PaginatedResult<AuditLog>>;
}
