import { User } from '../../domain/entities/index.js';
import { PaginatedResult } from 'shared/src/api/pagination.js';

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  create(entity: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User>;
  update(id: string, entity: Partial<User>): Promise<User | null>;
  list(page: number, pageSize: number): Promise<PaginatedResult<User>>;
}
