import { EventState } from 'shared';
import { InvalidStateTransitionError } from '../errors/index.js';

export class EventStateMachine {
  private static readonly allowedTransitions: Record<EventState, Set<EventState>> = {
    [EventState.OPEN]: new Set([EventState.ANALYZED]),
    [EventState.ANALYZED]: new Set([EventState.ASSESSED]),
    [EventState.ASSESSED]: new Set([EventState.CLOSED]),
    [EventState.CLOSED]: new Set(),
  };

  public static canTransition(currentState: EventState, requestedState: EventState): boolean {
    const validNextStates = this.allowedTransitions[currentState];
    if (!validNextStates) {
      return false;
    }
    return validNextStates.has(requestedState);
  }

  public static transition(currentState: EventState, requestedState: EventState): EventState {
    if (!this.canTransition(currentState, requestedState)) {
      throw new InvalidStateTransitionError('Event', currentState, requestedState);
    }
    return requestedState;
  }
}
