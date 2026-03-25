import { Request } from 'express';
import { UserRole } from '../../modules/users/entities/user.entity';

export interface AuthUser {
  userId: string;
  email: string;
  organizationId: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
