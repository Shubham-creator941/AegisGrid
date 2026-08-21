import { NetworkSnapshot } from '../../domain/entities/network-snapshot.js';
import { Scenario } from '../../domain/entities/scenario.js';
import { Event } from '../../domain/entities/event.js';
import { ScenarioAssumption } from '../../domain/entities/scenario-assumption.js';

export interface SimulationInput {
  networkState: NetworkSnapshot;
  scenario: Scenario;
  disruption: Event;
  assumptions: ScenarioAssumption[];
}
import { SimulationResult } from '../../domain/entities/simulation-result.js';

export interface SimulationEngine {
  simulate(input: SimulationInput): Promise<SimulationResult>;
}

export interface ScenarioContext {
  scenario: Scenario;
  disruption: Event;
}

export interface ImpactInput {
  simulationResult: SimulationResult;
  scenarioContext: ScenarioContext;
}
import { ImpactAssessment } from '../../domain/entities/impact-assessment.js';
import { ResponseCandidate } from '../../domain/entities/response-candidate.js';

export interface ImpactEngine {
  calculate(input: ImpactInput): Promise<ImpactAssessment>;
}

export interface ResponseInput {
  scenarioContext: ScenarioContext;
  simulationResult: SimulationResult;
  impactAssessment: ImpactAssessment;
}

export interface ResponseEngine {
  generate(input: ResponseInput): Promise<ResponseCandidate[]>;
}

export interface ConstraintInput {
  responseCandidate: ResponseCandidate;
  scenarioContext: ScenarioContext;
  networkSnapshot: NetworkSnapshot;
}

export interface ConstraintEngine {
  evaluate(input: ConstraintInput): Promise<ConstraintEvaluation>;
}

import { ConstraintEvaluation } from '../../domain/entities/constraint-evaluation.js';
import { ResponseScore } from '../../domain/entities/response-score.js';
import { RankedResponse } from '../../domain/entities/ranked-response.js';

export interface ScoringInput {
  responseCandidate: ResponseCandidate;
  constraintEvaluation: ConstraintEvaluation;
  impactAssessment: ImpactAssessment;
  scenarioContext: ScenarioContext;
}

export interface ScoringEngine {
  score(input: ScoringInput): Promise<ResponseScore>;
}

export interface RankingInput {
  scores: ResponseScore[];
}

export interface RankingEngine {
  rank(input: RankingInput): Promise<RankedResponse[]>;
}

import { Recommendation } from '../../domain/entities/recommendation.js';

export interface RecommendationInput {
  rankedResponses: RankedResponse[];
}

export interface RecommendationEngine {
  recommend(input: RecommendationInput): Promise<Recommendation>;
}
