export class InvalidStateTransitionError extends Error {
  public readonly code = 'INVALID_STATE_TRANSITION';

  constructor(
    public readonly entityType: string,
    public readonly currentState: string,
    public readonly requestedState: string
  ) {
    super(`Cannot transition ${entityType} from ${currentState} to ${requestedState}`);
    this.name = 'InvalidStateTransitionError';
  }
}
