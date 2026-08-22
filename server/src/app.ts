import express, { Express } from 'express';
import cors from 'cors';
import { healthRouter } from './api/routes/health.js';
import { errorHandler } from './api/middleware/error.js';
import { eventsRouter } from './api/routes/v1/events.js';
import { scenariosRouter } from './api/routes/v1/scenarios.js';
import { decisionsRouter } from './api/routes/v1/decisions.js';
import { evaluationsRouter } from './api/routes/v1/evaluations.js';

export function createApp(): Express {
  const app = express();

  // Baseline HTTP Middleware
  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/health', healthRouter);
  app.use('/api/v1/events', eventsRouter);
  app.use('/api/v1/scenarios', scenariosRouter);
  app.use('/api/v1/evaluations', evaluationsRouter);
  app.use('/api/v1/decisions', decisionsRouter);
  app.use('/api/v1/recommendations/:recommendationId/decisions', decisionsRouter); // Convenience sub-resource

  // Error Boundary
  app.use(errorHandler);

  return app;
}
