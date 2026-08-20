import express, { Express } from 'express';
import cors from 'cors';
import { healthRouter } from './api/routes/health';
import { errorHandler } from './api/middleware/error';

export function createApp(): Express {
  const app = express();

  // Baseline HTTP Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/health', healthRouter);

  // Error Boundary
  app.use(errorHandler);

  return app;
}
