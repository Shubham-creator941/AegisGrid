import test from 'node:test';
import assert from 'node:assert/strict';
import { DecisionController } from '../../../api/controllers/decision.controller.js';
import { MakeDecisionApplicationService } from '../../../application/services/decision/make-decision.service.js';

test('DecisionController', async (t) => {
  await t.test('makeDecision returns 201 on success', async () => {
    const mockService = {
      execute: async (input: any) => ({ ...input, id: 'dec-1' })
    } as unknown as MakeDecisionApplicationService;

    const controller = new DecisionController(mockService);

    const req = {
      params: { recommendationId: 'rec-1' },
      body: {
        decision_type: 'ACCEPT',
        reason: 'Looks good',
        decided_by: 'user-1'
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
    assert.equal(res.jsonBody.id, 'dec-1');
    assert.equal(res.jsonBody.recommendation_id, 'rec-1');
  });

  await t.test('makeDecision uses body recommendation_id if params missing', async () => {
    const mockService = {
      execute: async (input: any) => ({ ...input, id: 'dec-2' })
    } as unknown as MakeDecisionApplicationService;

    const controller = new DecisionController(mockService);

    const req = {
      params: {},
      body: {
        recommendation_id: 'rec-2',
        decision_type: 'REJECT',
        reason: 'Too expensive',
        decided_by: 'user-2'
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
    assert.equal(res.jsonBody.id, 'dec-2');
    assert.equal(res.jsonBody.recommendation_id, 'rec-2');
  });
});
