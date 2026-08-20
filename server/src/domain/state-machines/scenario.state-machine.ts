import { ScenarioState } from 'shared';
import { InvalidStateTransitionError } from '../errors/index.js';

export class ScenarioStateMachine {
  private static readonly allowedTransitions: Record<ScenarioState, Set<ScenarioState>> = {
    [ScenarioState.DRAFT]: new Set([ScenarioState.READY, ScenarioState.CANCELLED]),
    [ScenarioState.READY]: new Set([ScenarioState.EVALUATING]),
    [ScenarioState.EVALUATING]: new Set([ScenarioState.EVALUATED, ScenarioState.FAILED]),
    [ScenarioState.EVALUATED]: new Set([ScenarioState.RECOMMENDED, ScenarioState.CANCELLED]),
    [ScenarioState.RECOMMENDED]: new Set([ScenarioState.DECIDED]),
    [ScenarioState.DECIDED]: new Set(),
    [ScenarioState.CANCELLED]: new Set(),
    [ScenarioState.FAILED]: new Set([ScenarioState.EVALUATING]),
  };

  public static canTransition(currentState: ScenarioState, requestedState: ScenarioState): boolean {
    const validNextStates = this.allowedTransitions[currentState];
    if (!validNextStates) {
      return false;
    }
    return validNextStates.has(requestedState);
  }

  public static transition(currentState: ScenarioState, requestedState: ScenarioState): ScenarioState {
    if (!this.canTransition(currentState, requestedState)) {
      throw new InvalidStateTransitionError('Scenario', currentState, requestedState);
    }
    return requestedState;
  }
}
