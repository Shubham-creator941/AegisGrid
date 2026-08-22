import { UserRole } from 'shared';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  password_hash?: string;
  created_at: Date;
  updated_at: Date;
}
