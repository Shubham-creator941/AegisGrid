import { Event } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface EventRepository {
  findById(id: string): Promise<Event | null>;
  create(entity: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event>;
  update(id: string, entity: Partial<Event>): Promise<Event | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<Event>>;
}
