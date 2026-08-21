import test from 'node:test';
import assert from 'node:assert/strict';
import { ScenarioController } from '../../../api/controllers/scenario.controller.js';
import { CreateScenarioService } from '../../../application/services/scenario/create-scenario.service.js';

test('ScenarioController', async (t) => {
  await t.test('createScenario returns 201 on success', async () => {
    const mockService = {
      execute: async (input: any) => ({ ...input, id: 'scen-1' })
    } as unknown as CreateScenarioService;

    const controller = new ScenarioController(mockService);

    const req = {
      body: {
        name: 'Scenario 1',
        description: 'Test Scenario',
        event_id: 'evt-1',
        created_by: 'user-1'
      }
    } as any;

    const res = {
      statusCode: 0,
      jsonBody: null,
      status(code: number) { this.statusCode = code; return this; },
      json(data: any) { this.jsonBody = data; return this; }
    } as any;

    const next = (err?: any) => {};

    await controller.createScenario(req, res, next);

    assert.equal(res.statusCode, 201);
    assert.equal(res.jsonBody.id, 'scen-1');
  });

  await t.test('createScenario calls next on error', async () => {
    const mockService = {
      execute: async () => { throw new Error('Event not found'); }
    } as unknown as CreateScenarioService;

    const controller = new ScenarioController(mockService);

    const req = {
      body: {
        name: 'Scenario 1',
        description: 'Test Scenario',
        event_id: 'evt-missing',
        created_by: 'user-1'
      }
    } as any;

    const res = {
      status(code: number) { return this; },
      json(data: any) { return this; }
    } as any;

    let nextErr: any = null;
    const next = (err?: any) => { nextErr = err; };

    await controller.createScenario(req, res, next);

    assert.equal(nextErr.message, 'Event not found');
  });
});
