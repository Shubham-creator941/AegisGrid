import { Router, Request, Response, NextFunction } from 'express';
import { AuthApplicationService } from '../../../application/services/auth/auth.service.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { User } from '../../../domain/entities/user.js';

export interface LoginRequestDto {
  email?: string;
  password?: string;
}

export interface LoginResponseDto {
  success: boolean;
  data: {
    access_token: string;
    user: Omit<User, 'password_hash'>;
  };
}

export function createAuthRoutes(authService: AuthApplicationService): Router {
  const router = Router();

  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
