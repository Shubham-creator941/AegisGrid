-- AegisGrid Base Schema
-- Creates all tables required by the repository layer.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'VIEWER',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  country VARCHAR(255) NOT NULL,
  supplier_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS facilities (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  facility_type VARCHAR(100) NOT NULL,
  country VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  capacity NUMERIC NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS corridors (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  corridor_type VARCHAR(100) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  capacity NUMERIC NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supply_flows (
  id VARCHAR(255) PRIMARY KEY,
  supplier_id VARCHAR(255) NOT NULL REFERENCES suppliers(id),
  origin_facility_id VARCHAR(255) NOT NULL REFERENCES facilities(id),
  destination_facility_id VARCHAR(255) NOT NULL REFERENCES facilities(id),
  corridor_id VARCHAR(255) NOT NULL REFERENCES corridors(id),
  commodity VARCHAR(255) NOT NULL,
  capacity NUMERIC NOT NULL DEFAULT 0,
  baseline_volume NUMERIC NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'DETECTED',
  occurred_at TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL,
  affected_region VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evidence (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL REFERENCES events(id),
  source_type VARCHAR(100) NOT NULL,
  source_name VARCHAR(255) NOT NULL,
  source_reference VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  retrieved_at TIMESTAMPTZ NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_analysis (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL REFERENCES events(id),
  model_name VARCHAR(255) NOT NULL,
  model_version VARCHAR(100) NOT NULL,
  analysis_version INTEGER NOT NULL DEFAULT 1,
  structured_output JSONB,
  confidence NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_assessments (
  id VARCHAR(255) PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL REFERENCES events(id),
  assessment_version INTEGER NOT NULL DEFAULT 1,
  probability NUMERIC NOT NULL,
  severity NUMERIC NOT NULL,
  exposure NUMERIC NOT NULL,
  confidence NUMERIC NOT NULL,
  risk_level VARCHAR(50) NOT NULL,
  assessment_basis TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS scenarios (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  event_id VARCHAR(255) NOT NULL REFERENCES events(id),
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  scenario_version INTEGER NOT NULL DEFAULT 1,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scenario_assumptions (
  id VARCHAR(255) PRIMARY KEY,
  scenario_id VARCHAR(255) NOT NULL REFERENCES scenarios(id),
  parameter_name VARCHAR(255) NOT NULL,
  parameter_type VARCHAR(100) NOT NULL,
  parameter_value TEXT NOT NULL,
  unit VARCHAR(100),
  source VARCHAR(255) NOT NULL,
  confidence NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS network_snapshots (
  id VARCHAR(255) PRIMARY KEY,
  snapshot_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  snapshot_data JSONB
);

CREATE TABLE IF NOT EXISTS scenario_evaluations (
  id VARCHAR(255) PRIMARY KEY,
  scenario_id VARCHAR(255) NOT NULL REFERENCES scenarios(id),
  network_snapshot_id VARCHAR(255) NOT NULL REFERENCES network_snapshots(id),
  risk_assessment_id VARCHAR(255) NOT NULL REFERENCES risk_assessments(id),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  engine_version VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_results (
  id VARCHAR(255) PRIMARY KEY,
  evaluation_id VARCHAR(255) NOT NULL REFERENCES scenario_evaluations(id),
  available_supply NUMERIC NOT NULL DEFAULT 0,
  affected_capacity NUMERIC NOT NULL DEFAULT 0,
  shortfall NUMERIC NOT NULL DEFAULT 0,
  reserve_level NUMERIC NOT NULL DEFAULT 0,
  network_state JSONB,
  calculation_version VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS impact_assessments (
  id VARCHAR(255) PRIMARY KEY,
  evaluation_id VARCHAR(255) NOT NULL REFERENCES scenario_evaluations(id),
  supply_impact NUMERIC NOT NULL DEFAULT 0,
  economic_impact NUMERIC NOT NULL DEFAULT 0,
  operational_impact NUMERIC NOT NULL DEFAULT 0,
  reserve_impact NUMERIC NOT NULL DEFAULT 0,
  resilience_impact NUMERIC NOT NULL DEFAULT 0,
  overall_impact NUMERIC NOT NULL DEFAULT 0,
  calculation_version VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS response_candidates (
  id VARCHAR(255) PRIMARY KEY,
  evaluation_id VARCHAR(255) NOT NULL REFERENCES scenario_evaluations(id),
  response_type VARCHAR(100) NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  parameters JSONB,
  status VARCHAR(50) NOT NULL DEFAULT 'GENERATED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS constraint_evaluations (
  id VARCHAR(255) PRIMARY KEY,
  response_candidate_id VARCHAR(255) NOT NULL REFERENCES response_candidates(id),
  feasible BOOLEAN NOT NULL DEFAULT FALSE,
  violations JSONB,
  constraint_version VARCHAR(100) NOT NULL,
  evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS response_scores (
  id VARCHAR(255) PRIMARY KEY,
  response_candidate_id VARCHAR(255) NOT NULL REFERENCES response_candidates(id),
  overall_score NUMERIC NOT NULL DEFAULT 0,
  dimension_scores JSONB,
  weights JSONB,
  scoring_version VARCHAR(100) NOT NULL,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ranked_responses (
  id VARCHAR(255) PRIMARY KEY,
  evaluation_id VARCHAR(255) NOT NULL REFERENCES scenario_evaluations(id),
  response_candidate_id VARCHAR(255) NOT NULL REFERENCES response_candidates(id),
  rank INTEGER NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  ranking_version VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendations (
  id VARCHAR(255) PRIMARY KEY,
  evaluation_id VARCHAR(255) NOT NULL REFERENCES scenario_evaluations(id),
  response_candidate_id VARCHAR(255) NOT NULL REFERENCES response_candidates(id),
  rank INTEGER NOT NULL,
  score NUMERIC NOT NULL DEFAULT 0,
  rationale TEXT NOT NULL DEFAULT '',
  tradeoffs JSONB NOT NULL DEFAULT '[]'::JSONB,
  uncertainty JSONB NOT NULL DEFAULT '[]'::JSONB,
  confidence NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS human_decisions (
  id VARCHAR(255) PRIMARY KEY,
  recommendation_id VARCHAR(255) NOT NULL REFERENCES recommendations(id),
  decision_type VARCHAR(100) NOT NULL,
  selected_response_id VARCHAR(255) NOT NULL REFERENCES response_candidates(id),
  modification_notes TEXT,
  reason TEXT NOT NULL DEFAULT '',
  decided_by VARCHAR(255) NOT NULL,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  actor_id VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(255) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  before_state JSONB,
  after_state JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
