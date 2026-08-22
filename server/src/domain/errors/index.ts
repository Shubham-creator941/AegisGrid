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

export class BusinessRuleError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

export class AuthenticationError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
