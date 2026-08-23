import { 
  SimulationEngine, 
  ImpactEngine, 
  ResponseEngine, 
  ConstraintEngine, 
  ScoringEngine, 
  RankingEngine, 
  RecommendationEngine,
  ScenarioContext
} from '../../interfaces/engines.js';
import { Scenario } from '../../../domain/entities/scenario.js';
import { NetworkSnapshot } from '../../../domain/entities/network-snapshot.js';
import { RiskAssessment } from '../../../domain/entities/risk-assessment.js';
import { ScenarioAssumption } from '../../../domain/entities/scenario-assumption.js';
import { Event } from '../../../domain/entities/event.js';
import { SimulationResult } from '../../../domain/entities/simulation-result.js';
import { ImpactAssessment } from '../../../domain/entities/impact-assessment.js';
import { ResponseCandidate } from '../../../domain/entities/response-candidate.js';
import { ConstraintEvaluation } from '../../../domain/entities/constraint-evaluation.js';
import { ResponseScore } from '../../../domain/entities/response-score.js';
import { RankedResponse } from '../../../domain/entities/ranked-response.js';
import { Recommendation } from '../../../domain/entities/recommendation.js';

export interface EvaluationRequest {
  scenario: Scenario;
  disruption: Event;
  networkSnapshot: NetworkSnapshot;
  riskAssessment?: RiskAssessment;
  assumptions: ScenarioAssumption[];
}

export interface EvaluationResult {
  simulation: SimulationResult;
  impact: ImpactAssessment;
  responses: ResponseCandidate[];
  constraints: ConstraintEvaluation[];
  scores: ResponseScore[];
  ranking: RankedResponse[];
  recommendation: Recommendation | null;
}

export class EvaluationOrchestrator {
  constructor(
    private readonly simulationEngine: SimulationEngine,
    private readonly impactEngine: ImpactEngine,
    private readonly responseEngine: ResponseEngine,
    private readonly constraintEngine: ConstraintEngine,
    private readonly scoringEngine: ScoringEngine,
    private readonly rankingEngine: RankingEngine,
    private readonly recommendationEngine: RecommendationEngine
  ) {}

  public async evaluate(request: EvaluationRequest): Promise<EvaluationResult> {
    const scenarioContext: ScenarioContext = {
      scenario: request.scenario,
      disruption: request.disruption
    };

    // 1. Simulation
    const simulationResult = await this.simulationEngine.simulate({
      networkState: request.networkSnapshot,
      scenario: request.scenario,
      disruption: request.disruption,
      assumptions: request.assumptions
    });

    // 2. Impact
    const impactAssessment = await this.impactEngine.calculate({
      simulationResult,
      scenarioContext
    });

    // 3. Response Generation
    const responses = await this.responseEngine.generate({
      scenarioContext,
      simulationResult,
      impactAssessment
    });

    // 4. Constraint Evaluation
    const constraints: ConstraintEvaluation[] = [];
    for (const candidate of responses) {
      const constraint = await this.constraintEngine.evaluate({
        responseCandidate: candidate,
        scenarioContext,
        networkSnapshot: request.networkSnapshot
      });
      constraints.push(constraint);
    }

    // 5. Scoring
    const scores: ResponseScore[] = [];
    for (let i = 0; i < responses.length; i++) {
      const candidate = responses[i];
      const constraint = constraints[i];
      
      const score = await this.scoringEngine.score({
        responseCandidate: candidate,
        constraintEvaluation: constraint,
        impactAssessment,
        scenarioContext
      });
      scores.push(score);
    }

    // 6. Ranking (Only feasible candidates)
    let ranking: RankedResponse[] = [];
    const feasibleScores = scores.filter((_, i) => constraints[i].feasible);
    if (feasibleScores.length > 0) {
      ranking = await this.rankingEngine.rank({ scores: feasibleScores });
    }

    // 7. Recommendation
    // Engine guarantees selection of the highest valid ranked response deterministically
    let recommendation: Recommendation = null as any;
    if (ranking.length > 0) {
      recommendation = await this.recommendationEngine.recommend({
        rankedResponses: ranking
      });
    }

    return {
      simulation: simulationResult,
      impact: impactAssessment,
      responses,
      constraints,
      scores,
      ranking,
      recommendation
    };
  }
}
