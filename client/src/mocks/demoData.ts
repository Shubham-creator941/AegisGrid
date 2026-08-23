import type { Supplier, Facility, Corridor, SupplyFlow } from '../features/network/api/network.api';
import type { Event, Evidence, AIAnalysis, RiskAssessment } from '../features/events/api/events.api';
import type { Scenario } from '../features/scenarios/api/scenarios.api';
import type { EvaluationResult, Evaluation } from '../features/evaluations/api/evaluations.api';
import type { AuditLog } from '../features/audit/api/audit.api';

// Network Topology
export const mockSuppliers: Supplier[] = [
  { id: 'sup-1', name: 'Saudi Arabia', country: 'SA', supplier_type: 'SOVEREIGN', status: 'ACTIVE', current_supply: '3.45M', supply_share: '34%', active_routes: 8, risk_score: 35, risk_trend: 0, primary_terminal: 'Ras Tanura Terminal', supply_reliability: 'High', primary_corridor: 'Red Sea / Bab-el-Mandeb', supply_trend: [3.4, 3.42, 3.45, 3.41, 3.45, 3.45, 3.45], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sup-2', name: 'Iraq', country: 'IQ', supplier_type: 'SOVEREIGN', status: 'ACTIVE', current_supply: '1.18M', supply_share: '11%', active_routes: 3, risk_score: 72, risk_trend: 4, primary_terminal: 'Basrah Oil Terminal', supply_reliability: 'High', primary_corridor: 'Strait of Hormuz', supply_trend: [0.9, 0.95, 0.98, 1.0, 1.05, 1.1, 1.18], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sup-3', name: 'UAE', country: 'AE', supplier_type: 'SOVEREIGN', status: 'ACTIVE', current_supply: '0.85M', supply_share: '8%', active_routes: 4, risk_score: 45, risk_trend: 2, primary_terminal: 'Fujairah / Jebel Dhanna', supply_reliability: 'High', primary_corridor: 'Strait of Hormuz', supply_trend: [0.8, 0.81, 0.82, 0.85, 0.85, 0.85, 0.85], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sup-4', name: 'Russia', country: 'RU', supplier_type: 'SOVEREIGN', status: 'ACTIVE', current_supply: '0.62M', supply_share: '6%', active_routes: 2, risk_score: 85, risk_trend: -1, primary_terminal: 'Novorossiysk Terminal', supply_reliability: 'Moderate', primary_corridor: 'Bosporus', supply_trend: [0.65, 0.64, 0.63, 0.62, 0.62, 0.62, 0.62], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'sup-5', name: 'Other / Diverse', country: '—', supplier_type: 'MARKET', status: 'ACTIVE', current_supply: '0.45M', supply_share: '4%', active_routes: 12, risk_score: 25, risk_trend: 0, primary_terminal: 'Multiple', supply_reliability: 'High', primary_corridor: 'Various', supply_trend: [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const mockFacilities: Facility[] = [
  { id: 'fac-1', name: 'Ras Tanura Terminal', facility_type: 'EXPORT_TERMINAL', country: 'SA', region: 'Gulf', capacity: 6500000, current_throughput: '3.45M bbl/d', risk_level: 'Normal', risk_score: 30, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fac-2', name: 'Basrah Oil Terminal', facility_type: 'EXPORT_TERMINAL', country: 'IQ', region: 'Gulf', capacity: 3000000, current_throughput: '1.18M bbl/d', risk_level: 'Elevated', risk_score: 65, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fac-3', name: 'Fujairah / Jebel Dhanna', facility_type: 'EXPORT_TERMINAL', country: 'AE', region: 'Gulf', capacity: 2000000, current_throughput: '1.2M bbl/d', risk_level: 'Normal', risk_score: 40, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fac-4', name: 'Novorossiysk Terminal', facility_type: 'EXPORT_TERMINAL', country: 'RU', region: 'Black Sea', capacity: 1500000, current_throughput: '0.62M bbl/d', risk_level: 'High', risk_score: 82, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fac-5', name: 'Jamnagar Refinery Complex', facility_type: 'REFINERY', country: 'IN', region: 'West Coast', capacity: 1240000, current_throughput: '1.24M bbl/d', risk_level: 'Normal', risk_score: 20, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fac-6', name: 'Visakhapatnam Refinery & SPR', facility_type: 'REFINERY_SPR', country: 'IN', region: 'East Coast', capacity: 500000, current_throughput: '0.45M bbl/d', risk_level: 'Normal', risk_score: 15, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fac-7', name: 'Mangalore Refinery & SPR', facility_type: 'REFINERY_SPR', country: 'IN', region: 'West Coast', capacity: 300000, current_throughput: '0.25M bbl/d', risk_level: 'Normal', risk_score: 12, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fac-8', name: 'Rotterdam Storage', facility_type: 'STORAGE_HUB', country: 'NL', region: 'Europe', capacity: 4000000, current_throughput: '0.9M bbl/d', risk_level: 'Normal', risk_score: 10, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'fac-9', name: 'Singapore Storage', facility_type: 'STORAGE_HUB', country: 'SG', region: 'Asia', capacity: 3500000, current_throughput: '0.7M bbl/d', risk_level: 'Normal', risk_score: 18, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const mockCorridors: Corridor[] = [
  { id: 'cor-1', name: 'Strait of Hormuz', corridor_type: 'MARITIME_CHOKEPOINT', origin: 'Gulf', destination: 'Arabian Sea', direction: 'Gulf → Arabian Sea', affected_regions: ['Middle East', 'Asia'], capacity: 21000000, current_throughput: '18.5M bbl/d', risk_score: 72, status: 'CRITICAL', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cor-2', name: 'Red Sea / Bab-el-Mandeb', corridor_type: 'MARITIME_CHOKEPOINT', origin: 'Red Sea', destination: 'Arabian Sea', direction: 'Red Sea ↔ Arabian Sea', affected_regions: ['Europe', 'Asia'], capacity: 6000000, current_throughput: '4.8M bbl/d', risk_score: 85, status: 'DISRUPTED', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cor-3', name: 'Saudi Petroline (East-West bypass)', corridor_type: 'PIPELINE', origin: 'East Province', destination: 'Red Sea', direction: 'East → West', affected_regions: ['Saudi Arabia'], capacity: 5000000, current_throughput: '2.1M bbl/d', risk_score: 25, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cor-4', name: 'Strait of Malacca', corridor_type: 'MARITIME_CHOKEPOINT', origin: 'Indian Ocean', destination: 'South China Sea', direction: 'West → East', affected_regions: ['Asia'], capacity: 19000000, current_throughput: '16.0M bbl/d', risk_score: 45, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cor-5', name: 'Cape of Good Hope', corridor_type: 'MARITIME_CORRIDOR', origin: 'Atlantic Ocean', destination: 'Indian Ocean', direction: 'West ↔ East', affected_regions: ['Global'], capacity: 30000000, current_throughput: '8.5M bbl/d', risk_score: 15, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cor-6', name: 'Taiwan Strait', corridor_type: 'MARITIME_CHOKEPOINT', origin: 'South China Sea', destination: 'East China Sea', direction: 'South ↔ North', affected_regions: ['East Asia'], capacity: 15000000, current_throughput: '12.0M bbl/d', risk_score: 68, status: 'CRITICAL', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const mockSupplyFlows: SupplyFlow[] = [
  { id: 'flow-1', supplier_id: 'sup-1', origin_facility_id: 'fac-1', destination_facility_id: 'fac-8', corridor_id: 'cor-2', commodity: 'CRUDE_OIL', capacity: 1000000, baseline_volume: 800000, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'flow-2', supplier_id: 'sup-2', origin_facility_id: 'fac-2', destination_facility_id: 'fac-5', corridor_id: 'cor-1', commodity: 'CRUDE_OIL', capacity: 500000, baseline_volume: 450000, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'flow-3', supplier_id: 'sup-3', origin_facility_id: 'fac-3', destination_facility_id: 'fac-9', corridor_id: 'cor-1', commodity: 'CRUDE_OIL', capacity: 300000, baseline_volume: 250000, status: 'ACTIVE', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// Events
export const mockEvents: Event[] = [
  {
    id: 'evt-1',
    title: 'Strait of Hormuz Blockade',
    description: 'Naval blockade in the Strait of Hormuz disrupting maritime traffic.',
    event_type: 'GEOPOLITICAL',
    severity: 'CRITICAL',
    status: 'ANALYZED',
    occurred_at: new Date().toISOString(),
    detected_at: new Date().toISOString(),
    affected_region: 'Strait of Hormuz',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockEvidence: Evidence[] = [
  {
    id: 'evid-1',
    event_id: 'evt-1',
    source_type: 'SATELLITE_IMAGERY',
    source_name: 'Aegis Orbital',
    source_reference: 'ORB-992-A',
    content: 'Imagery confirms naval vessels blocking shipping lanes.',
    published_at: new Date().toISOString(),
    retrieved_at: new Date().toISOString(),
    confidence: 0.95,
    created_at: new Date().toISOString()
  }
];

export const mockAnalysis: AIAnalysis = {
  id: 'ana-1',
  event_id: 'evt-1',
  model_name: 'Aegis Intelligence',
  model_version: 'v2.1',
  analysis_version: 1,
  structured_output: {
    threat_level: 'HIGH',
    impact_duration: '30_DAYS',
    affected_nodes: ['cor-1']
  },
  confidence: 0.9,
  created_at: new Date().toISOString()
};

export const mockRiskAssessment: RiskAssessment = {
  id: 'risk-1',
  event_id: 'evt-1',
  assessment_version: 1,
  probability: 0.8,
  severity: 0.95,
  exposure: 0.85,
  confidence: 0.9,
  risk_level: 'CRITICAL',
  assessment_basis: 'Satellite imagery and regional naval activity.',
  created_at: new Date().toISOString(),
  created_by: 'system'
};

// Scenarios
export const mockScenarios: Scenario[] = [
  {
    id: 'scn-1',
    name: 'Worst Case: Hormuz Total Closure',
    description: 'Complete closure of Strait of Hormuz for 30 days.',
    event_id: 'evt-1',
    status: 'EVALUATED',
    scenario_version: 1,
    start_time: new Date().toISOString(),
    end_time: new Date().toISOString(),
    created_by: 'system',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Evaluations
const evalDate = new Date();
export const mockEvaluation: Evaluation = {
  id: 'eval-1',
  scenario_id: 'scn-1',
  network_snapshot_id: 'snap-1',
  risk_assessment_id: 'risk-1',
  status: 'COMPLETED',
  started_at: evalDate.toISOString(),
  completed_at: new Date(evalDate.getTime() + 5000).toISOString(),
  engine_version: '1.1.0-demo',
  created_at: evalDate.toISOString()
};

export const mockEvaluationResult: EvaluationResult = {
  evaluation: mockEvaluation,
  simulation: {
    shortfall: 1500000,
    affected_flow_ids: ['flow-1', 'flow-2', 'flow-3'],
    network_state: {
      timestamp: new Date().toISOString()
    }
  },
  impact: {
    id: 'imp-1',
    evaluation_id: 'eval-1',
    supply_impact: 0.35,
    economic_impact: 0.45,
    operational_impact: 0.60,
    reserve_impact: 0.25,
    resilience_impact: 0.50,
    overall_impact: 0.72,
    calculation_version: '1.1.0-demo',
    created_at: new Date().toISOString()
  },
  responses: [
    {
      id: 'resp-1',
      evaluation_id: 'eval-1',
      action_type: 'REROUTE',
      name: 'Reroute via Petroline',
      description: 'Divert Saudi crude via East-West pipeline to Red Sea',
      parameters: { capacity_diverted: 800000, affected_node_ids: ['cor-3', 'fac-1'] },
      status: 'FEASIBLE'
    },
    {
      id: 'resp-2',
      evaluation_id: 'eval-1',
      action_type: 'STRATEGIC_RESERVE',
      name: 'Release Strategic Reserves',
      description: 'Release crude from Visakhapatnam & Mangalore SPR',
      parameters: { release_volume: 500000, affected_node_ids: ['fac-6', 'fac-7'] },
      status: 'FEASIBLE'
    }
  ],
  constraints: [
    {
      id: 'const-1',
      response_candidate_id: 'resp-1',
      feasible: true,
      violations: [],
      constraint_version: '1.0',
      evaluated_at: new Date().toISOString()
    },
    {
      id: 'const-2',
      response_candidate_id: 'resp-2',
      feasible: true,
      violations: [],
      constraint_version: '1.0',
      evaluated_at: new Date().toISOString()
    }
  ],
  scores: [
    {
      id: 'score-1',
      response_candidate_id: 'resp-1',
      overall_score: 85.5,
      dimension_scores: {},
      weights: {},
      scoring_version: '1.0',
      calculated_at: new Date().toISOString()
    },
    {
      id: 'score-2',
      response_candidate_id: 'resp-2',
      overall_score: 72.0,
      dimension_scores: {},
      weights: {},
      scoring_version: '1.0',
      calculated_at: new Date().toISOString()
    }
  ],
  ranking: [
    { candidate: { id: 'resp-1' }, score: { overall_score: 85.5 }, rank: 1 },
    { candidate: { id: 'resp-2' }, score: { overall_score: 72.0 }, rank: 2 }
  ],
  recommendation: {
    id: 'rec-1',
    evaluation_id: 'eval-1',
    response_candidate_id: 'resp-1',
    rank: 1,
    score: 85.5,
    rationale: 'Highest impact mitigation with feasible pipeline bypass. Minimizes SPR depletion.',
    tradeoffs: ['Increased transit time', 'Requires immediate coordination with Saudi Aramco'],
    uncertainty: 0.1,
    confidence: 0.9,
    created_at: new Date().toISOString()
  }
};

export const mockDecisions: Record<string, any> = {
  'rec-1': {
    id: 'dec-1',
    recommendation_id: 'rec-1',
    decision_type: 'ACCEPT',
    selected_response_id: 'resp-1',
    reason: 'Approved due to high confidence and minimal SPR depletion.',
    decided_by: 'usr-1',
    created_at: new Date().toISOString()
  }
};

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    action: 'DECISION_ACCEPT',
    actor_id: 'usr-admin',
    entity_type: 'Decision',
    entity_id: 'dec-1',
    before_state: null,
    after_state: { decision_type: 'ACCEPT', selected_response_id: 'resp-1', reason: 'Approved due to high confidence.' },
    metadata: { source: 'demo' },
    created_at: new Date().toISOString()
  },
  {
    id: 'log-2',
    action: 'EVALUATION_COMPLETED',
    actor_id: 'system',
    entity_type: 'Evaluation',
    entity_id: 'eval-1',
    before_state: { status: 'RUNNING' },
    after_state: { status: 'COMPLETED' },
    metadata: { source: 'demo' },
    created_at: new Date().toISOString()
  }
];
