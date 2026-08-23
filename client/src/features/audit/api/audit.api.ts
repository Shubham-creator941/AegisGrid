import { apiClient } from '../../../api/client';

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  before_state?: any;
  after_state?: any;
  metadata?: any;
  created_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface AuditFilters {
  actor_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
}

export const AuditApi = {
  listAuditLogs: (page: number = 1, pageSize: number = 50, filters: AuditFilters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined && v !== ''))
    });
    return apiClient.get<PaginatedResult<AuditLog>>(`/api/v1/audit?${params.toString()}`).then(res => res.data);
  }
};
