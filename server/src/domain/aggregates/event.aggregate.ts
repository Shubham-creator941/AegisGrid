import { Event, Evidence } from '../entities/index.js';
import { EventState } from 'shared';
import { EventStateMachine } from '../state-machines/index.js';

export class EventAggregate {
  private constructor(
    private event: Event,
    private evidences: Evidence[]
  ) {}

  public static restore(event: Event, evidences: Evidence[]): EventAggregate {
    return new EventAggregate({ ...event }, [...evidences]);
  }

  public get id(): string { return this.event.id; }
  public get status(): EventState { return this.event.status; }
  public get currentEvent(): Readonly<Event> { return { ...this.event }; }
  public get currentEvidences(): ReadonlyArray<Evidence> { return [...this.evidences]; }

  public addEvidence(evidence: Evidence): void {
    this.evidences.push({ ...evidence });
  }

  public markAnalyzed(): void {
    this.event.status = EventStateMachine.transition(this.event.status, EventState.ANALYZED);
  }

  public markAssessed(): void {
    this.event.status = EventStateMachine.transition(this.event.status, EventState.ASSESSED);
  }

  public close(): void {
    this.event.status = EventStateMachine.transition(this.event.status, EventState.CLOSED);
  }
}
