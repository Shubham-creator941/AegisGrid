import { Router } from 'express';
import { HealthResponse } from 'shared';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  const response: HealthResponse = { status: 'ok', service: 'aegis-grid-backend' };
  res.status(200).json(response);
});
