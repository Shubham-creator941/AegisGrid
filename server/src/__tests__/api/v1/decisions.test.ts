import test from 'node:test';
import assert from 'node:assert/strict';
import { DecisionController } from '../../../api/controllers/decision.controller.js';
import { MakeDecisionApplicationService } from '../../../application/services/decision/make-decision.service.js';
import { GetDecisionApplicationService } from '../../../application/services/decision/get-decision.service.js';

test('DecisionController', async (t) => {
  await t.test('makeDecision returns 201 on success', async () => {
    const mockService = {
      execute: async (input: any) => ({ ...input, id: 'dec-1' })
    } as unknown as MakeDecisionApplicationService;
    
    const mockGetService = {} as unknown as GetDecisionApplicationService;

    const controller = new DecisionController(mockService, mockGetService);

    const req = {
      headers: {},
      params: { id: 'rec-1' },
      user: { id: 'user-1' },
      body: {
        decision: 'ACCEPT',
        rationale: 'Looks good'
      }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.makeDecision(req, res, next);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonBody.success, true);
    assert.equal(res.jsonBody.data.id, 'dec-1');
    assert.equal(res.jsonBody.data.recommendation_id, 'rec-1');
  });

  await t.test('makeDecision uses body recommendation_id if params missing', async () => {
    const mockService = {
      execute: async (input: any) => ({ ...input, id: 'dec-2' })
    } as unknown as MakeDecisionApplicationService;
    
    const mockGetService = {} as unknown as GetDecisionApplicationService;

    const controller = new DecisionController(mockService, mockGetService);

    const req = {
      headers: {},
      params: {},
      user: { id: 'user-2' },
      body: {
        recommendation_id: 'rec-2',
        decision: 'REJECT',
        rationale: 'Too expensive'
      }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.makeDecision(req, res, next);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonBody.success, true);
    assert.equal(res.jsonBody.data.id, 'dec-2');
    assert.equal(res.jsonBody.data.recommendation_id, 'rec-2');
  });
});
