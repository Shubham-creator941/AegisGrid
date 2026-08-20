import test from 'node:test';
import assert from 'node:assert/strict';
import { ScenarioState } from 'shared';
import { ScenarioStateMachine } from '../state-machines/scenario.state-machine.js';
import { InvalidStateTransitionError } from '../errors/index.js';

test('ScenarioStateMachine', async (t) => {
  await t.test('allows valid transitions', () => {
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DRAFT, ScenarioState.READY), true);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.READY, ScenarioState.EVALUATING), true);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.EVALUATING, ScenarioState.EVALUATED), true);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.EVALUATED, ScenarioState.RECOMMENDED), true);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.RECOMMENDED, ScenarioState.DECIDED), true);
    
    // Cancellation
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DRAFT, ScenarioState.CANCELLED), true);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.EVALUATED, ScenarioState.CANCELLED), true);
    
    // Failure/Retry
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.EVALUATING, ScenarioState.FAILED), true);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.FAILED, ScenarioState.EVALUATING), true);
  });

  await t.test('rejects representative invalid transitions', () => {
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DRAFT, ScenarioState.EVALUATED), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DRAFT, ScenarioState.DECIDED), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.READY, ScenarioState.RECOMMENDED), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.EVALUATING, ScenarioState.DECIDED), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.EVALUATED, ScenarioState.DECIDED), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.RECOMMENDED, ScenarioState.EVALUATING), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DECIDED, ScenarioState.DRAFT), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DECIDED, ScenarioState.EVALUATING), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.FAILED, ScenarioState.DECIDED), false);
    
    // FAILED cannot bypass evaluation
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.FAILED, ScenarioState.READY), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.FAILED, ScenarioState.EVALUATED), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.FAILED, ScenarioState.RECOMMENDED), false);
  });

  await t.test('terminal state DECIDED allows no transitions', () => {
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DECIDED, ScenarioState.DRAFT), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DECIDED, ScenarioState.READY), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DECIDED, ScenarioState.EVALUATING), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DECIDED, ScenarioState.FAILED), false);
    assert.equal(ScenarioStateMachine.canTransition(ScenarioState.DECIDED, ScenarioState.CANCELLED), false);
  });

  await t.test('transition() returns target state for valid transition', () => {
    const nextState = ScenarioStateMachine.transition(ScenarioState.DRAFT, ScenarioState.READY);
    assert.equal(nextState, ScenarioState.READY);
  });

  await t.test('transition() throws InvalidStateTransitionError for invalid transition', () => {
    assert.throws(() => {
      ScenarioStateMachine.transition(ScenarioState.DRAFT, ScenarioState.EVALUATED);
    }, (err: Error) => {
      assert(err instanceof InvalidStateTransitionError);
      assert.equal(err.name, 'InvalidStateTransitionError');
      assert.equal((err as InvalidStateTransitionError).code, 'INVALID_STATE_TRANSITION');
      assert.equal((err as InvalidStateTransitionError).currentState, ScenarioState.DRAFT);
      assert.equal((err as InvalidStateTransitionError).requestedState, ScenarioState.EVALUATED);
      return true;
    });
  });
});
