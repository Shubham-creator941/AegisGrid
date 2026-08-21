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

export interface SimulationResult {
  available_supply: number;
  affected_capacity: number;
  shortfall: number;
  reserve_level: number;
  network_state: unknown;
  calculation_version: string;
}

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
export interface ImpactResult {
  supply_impact: number;
  economic_impact: number;
  operational_impact: number;
  reserve_impact: number;
  resilience_impact: number;
  overall_impact: number;
  calculation_version: string;
}
import { ImpactAssessment } from '../../domain/entities/impact-assessment.js';
import { ResponseCandidate } from '../../domain/entities/response-candidate.js';

export interface ImpactEngine {
  calculate(input: ImpactInput): Promise<ImpactResult>;
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
  responseCandidateId: string;
}
export interface ConstraintResult {
  feasible: boolean;
  violations: any;
  constraint_version: string;
}
export interface ConstraintEngine {
  evaluate(input: ConstraintInput): Promise<ConstraintResult>;
}

export interface ScoringInput {
  candidateId: string;
}
export interface ScoringResult {
  overall_score: number;
  dimension_scores: any;
  weights: any;
  scoring_version: string;
}
export interface ScoringEngine {
  score(input: ScoringInput): Promise<ScoringResult>;
}

export interface RankingInput {
  evaluationId: string;
}
export interface RankedResult {
  candidateId: string;
  rank: number;
}
export interface RankingEngine {
  rank(input: RankingInput): Promise<RankedResult[]>;
}

export interface RecommendationInput {
  evaluationId: string;
}
export interface RecommendationResult {
  recommended_response_id: string;
  score: number;
  confidence: number;
  rationale: string;
  tradeoffs: string[];
  uncertainty: string[];
}
export interface RecommendationEngine {
  recommend(input: RecommendationInput): Promise<RecommendationResult>;
}
