import test from 'node:test';
import assert from 'node:assert/strict';
import { EventState } from 'shared';
import { EventStateMachine } from '../state-machines/event.state-machine.js';
import { InvalidStateTransitionError } from '../errors/index.js';

test('EventStateMachine', async (t) => {
  await t.test('allows valid transitions', () => {
    assert.equal(EventStateMachine.canTransition(EventState.OPEN, EventState.ANALYZED), true);
    assert.equal(EventStateMachine.canTransition(EventState.ANALYZED, EventState.ASSESSED), true);
    assert.equal(EventStateMachine.canTransition(EventState.ASSESSED, EventState.CLOSED), true);
  });

  await t.test('rejects invalid transitions', () => {
    assert.equal(EventStateMachine.canTransition(EventState.OPEN, EventState.ASSESSED), false);
    assert.equal(EventStateMachine.canTransition(EventState.OPEN, EventState.CLOSED), false);
    assert.equal(EventStateMachine.canTransition(EventState.ANALYZED, EventState.CLOSED), false);
    
    // Backward transitions
    assert.equal(EventStateMachine.canTransition(EventState.ANALYZED, EventState.OPEN), false);
    assert.equal(EventStateMachine.canTransition(EventState.ASSESSED, EventState.ANALYZED), false);
    assert.equal(EventStateMachine.canTransition(EventState.CLOSED, EventState.ASSESSED), false);
  });

  await t.test('terminal state CLOSED allows no transitions', () => {
    assert.equal(EventStateMachine.canTransition(EventState.CLOSED, EventState.OPEN), false);
    assert.equal(EventStateMachine.canTransition(EventState.CLOSED, EventState.ANALYZED), false);
    assert.equal(EventStateMachine.canTransition(EventState.CLOSED, EventState.ASSESSED), false);
  });

  await t.test('transition() returns target state for valid transition', () => {
    const nextState = EventStateMachine.transition(EventState.OPEN, EventState.ANALYZED);
    assert.equal(nextState, EventState.ANALYZED);
  });

  await t.test('transition() throws InvalidStateTransitionError for invalid transition', () => {
    assert.throws(() => {
      EventStateMachine.transition(EventState.OPEN, EventState.CLOSED);
    }, (err: Error) => {
      assert(err instanceof InvalidStateTransitionError);
      assert.equal(err.name, 'InvalidStateTransitionError');
      assert.equal((err as InvalidStateTransitionError).code, 'INVALID_STATE_TRANSITION');
      assert.equal((err as InvalidStateTransitionError).currentState, EventState.OPEN);
      assert.equal((err as InvalidStateTransitionError).requestedState, EventState.CLOSED);
      return true;
    });
  });
});
