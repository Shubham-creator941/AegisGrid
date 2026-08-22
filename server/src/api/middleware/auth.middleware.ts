import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index.js';
import { AuthenticationError } from '../../domain/errors/index.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AuthenticationError('AUTH_REQUIRED', 'Authorization header is missing'));
  }

  const [bearer, token] = authHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next(new AuthenticationError('AUTH_INVALID_TOKEN', 'Invalid authorization format. Expected Bearer token'));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AuthenticationError('AUTH_TOKEN_EXPIRED', 'Token has expired'));
    }
    return next(new AuthenticationError('AUTH_INVALID_TOKEN', 'Invalid token'));
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError('AUTH_REQUIRED', 'User is not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'User does not have required permissions'
        }
      });
    }

    next();
  };
};
