import { Request, Response, NextFunction } from 'express';
import { InvalidStateTransitionError, BusinessRuleError } from '../../domain/errors/index.js';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof InvalidStateTransitionError) {
    return res.status(409).json({
      error: 'Conflict',
      message: err.message,
      code: err.code
    });
  }

  if (err instanceof BusinessRuleError) {
    return res.status(422).json({
      error: 'Unprocessable Entity',
      message: err.message,
      code: err.code
    });
  }

  if (err.message === 'Event not found' || err.message === 'Recommendation not found' || err.message.includes('not found')) {
    return res.status(404).json({
      error: 'Not Found',
      message: err.message
    });
  }

  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
}
