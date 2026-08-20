import { Request, Response, NextFunction } from 'express';

// Placeholder for future API error taxonomy implementation
export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
}
