import { Scenario, ScenarioAssumption } from '../entities/index.js';
import { ScenarioState } from 'shared';
import { ScenarioStateMachine } from '../state-machines/index.js';
import { ScenarioRules } from '../rules/index.js';

export class ScenarioAggregate {
  private constructor(
    private scenario: Scenario,
    private assumptions: ScenarioAssumption[]
  ) {}

  public static restore(scenario: Scenario, assumptions: ScenarioAssumption[]): ScenarioAggregate {
    return new ScenarioAggregate({ ...scenario }, [...assumptions]);
  }
  
  public get id(): string { return this.scenario.id; }
  public get status(): ScenarioState { return this.scenario.status; }
  public get eventId(): string { return this.scenario.event_id; }
  public get currentScenario(): Readonly<Scenario> { return { ...this.scenario }; }
  public get currentAssumptions(): ReadonlyArray<ScenarioAssumption> { return [...this.assumptions]; }
  
  public addAssumption(assumption: ScenarioAssumption): void {
    ScenarioRules.assertScenarioIsEditable(this.scenario.status);
    this.assumptions.push({ ...assumption });
  }

  public markReady(hasEvent: boolean, hasEvidenceOrAnalysis: boolean, hasRiskAssessment: boolean): void {
    ScenarioRules.validateReadyForEvaluation(this.scenario.status, hasEvent, hasEvidenceOrAnalysis, hasRiskAssessment);
    this.scenario.status = ScenarioStateMachine.transition(this.scenario.status, ScenarioState.READY);
  }

  public beginEvaluation(): void {
    this.scenario.status = ScenarioStateMachine.transition(this.scenario.status, ScenarioState.EVALUATING);
  }

  public completeEvaluation(): void {
    this.scenario.status = ScenarioStateMachine.transition(this.scenario.status, ScenarioState.EVALUATED);
  }

  public recommend(): void {
    this.scenario.status = ScenarioStateMachine.transition(this.scenario.status, ScenarioState.RECOMMENDED);
  }
  
  public decide(): void {
    this.scenario.status = ScenarioStateMachine.transition(this.scenario.status, ScenarioState.DECIDED);
  }
  
  public cancel(): void {
    this.scenario.status = ScenarioStateMachine.transition(this.scenario.status, ScenarioState.CANCELLED);
  }

  public fail(): void {
    this.scenario.status = ScenarioStateMachine.transition(this.scenario.status, ScenarioState.FAILED);
  }
}
