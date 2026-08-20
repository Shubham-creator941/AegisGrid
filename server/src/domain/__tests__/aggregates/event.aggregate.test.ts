import test from 'node:test';
import assert from 'node:assert/strict';
import { EventState } from 'shared';
import { Event, Evidence } from '../../entities/index.js';
import { EventType } from '../../enums/index.js';
import { EventAggregate } from '../../aggregates/event.aggregate.js';
import { InvalidStateTransitionError } from '../../errors/index.js';

test('EventAggregate', async (t) => {
  const mockEvent: Event = {
    id: 'ev-1',
    title: 'Test Event',
    description: 'A test event',
    severity: 'HIGH',
    status: EventState.OPEN,
    event_type: EventType.GEOPOLITICAL,
    affected_region: 'NY',
    occurred_at: new Date(),
    detected_at: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockEvidence: Evidence = {
    id: 'evid-1',
    event_id: 'ev-1',
    source_type: 'SENSOR',
    source_name: 'sensor-1',
    source_reference: 'ref-1',
    content: 'test',
    confidence: 0.9,
    published_at: new Date(),
    retrieved_at: new Date(),
    created_at: new Date(),
  };

  await t.test('restores aggregate and provides getters', () => {
    const aggregate = EventAggregate.restore(mockEvent, [mockEvidence]);
    assert.equal(aggregate.id, 'ev-1');
    assert.equal(aggregate.status, EventState.OPEN);
    assert.equal(aggregate.currentEvent.status, EventState.OPEN);
    assert.equal(aggregate.currentEvidences.length, 1);
  });

  await t.test('addEvidence adds evidence', () => {
    const aggregate = EventAggregate.restore(mockEvent, []);
    aggregate.addEvidence(mockEvidence);
    assert.equal(aggregate.currentEvidences.length, 1);
    assert.equal(aggregate.currentEvidences[0].id, 'evid-1');
  });

  await t.test('state machine transitions', () => {
    const aggregate = EventAggregate.restore(mockEvent, []);
    aggregate.markAnalyzed();
    assert.equal(aggregate.status, EventState.ANALYZED);
    aggregate.markAssessed();
    assert.equal(aggregate.status, EventState.ASSESSED);
    aggregate.close();
    assert.equal(aggregate.status, EventState.CLOSED);
  });

  await t.test('state machine protects terminal state', () => {
    const aggregate = EventAggregate.restore({ ...mockEvent, status: EventState.CLOSED }, []);
    assert.throws(() => aggregate.markAnalyzed(), (err: Error) => {
      assert(err instanceof InvalidStateTransitionError);
      return true;
    });
  });
});
