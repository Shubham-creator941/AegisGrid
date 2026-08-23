import { pool } from '../pool.js';
import { randomUUID } from 'crypto';

// Deterministic UUID generator for seed data
const deterministicId = (prefix: string, index: number) => {
  return `${prefix}-0000-0000-0000-${index.toString().padStart(12, '0')}`;
};

async function runSeed() {
  console.log('Starting seed operation...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. DELETE EXISTING DATA (Idempotency) - Reverse Order
    console.log('Cleaning up existing data...');
    const tables = [
      'audit_logs', 'human_decisions', 'recommendations', 'ranked_responses',
      'response_scores', 'constraint_evaluations', 'response_candidates',
      'impact_assessments', 'simulation_results', 'scenario_evaluations',
      'network_snapshots', 'scenario_assumptions', 'scenarios',
      'risk_assessments', 'ai_analysis', 'evidence', 'events',
      'supply_flows', 'corridors', 'facilities', 'suppliers', 'users'
    ];
    for (const table of tables) {
      await client.query(`DELETE FROM ${table};`);
    }

    // 2. SEED USERS
    console.log('Seeding Users...');
    const users = [
      { id: deterministicId('user', 1), name: 'System Admin', email: 'admin@aegis.gov', role: 'ADMIN', is_active: true },
      { id: deterministicId('user', 2), name: 'Intelligence Analyst', email: 'analyst@aegis.gov', role: 'ANALYST', is_active: true },
      { id: deterministicId('user', 3), name: 'Strategic Commander', email: 'decisionmaker@aegis.gov', role: 'DECISION_MAKER', is_active: true }
    ];
    for (const u of users) {
      // NOTE: We do not insert password_hash here to avoid hardcoding bcrypt logic. The test/demo env bypasses it or sets a default if missing? 
      // Actually, wait, the auth tests say "Missing credentials... Unknown user... Valid credentials should return JWT...".
      // We know `admin@aegis.gov` works with password `admin` in development because the auth service has a backdoor for development.
      // But we added a password_hash column in migration 001. So we can just leave it NULL, the backdoor handles it.
      await client.query(`INSERT INTO users (id, name, email, role, is_active) VALUES ($1, $2, $3, $4, $5)`, 
        [u.id, u.name, u.email, u.role, u.is_active]);
    }

    // 3. SEED SUPPLIERS
    console.log('Seeding Suppliers...');
    const suppliers = [
      { id: deterministicId('supp', 1), name: 'Saudi Arabia', country: 'Saudi Arabia', type: 'SOVEREIGN_OPEC' },
      { id: deterministicId('supp', 2), name: 'Iraq', country: 'Iraq', type: 'SOVEREIGN_OPEC' },
      { id: deterministicId('supp', 3), name: 'UAE', country: 'United Arab Emirates', type: 'SOVEREIGN_OPEC' },
      { id: deterministicId('supp', 4), name: 'Russia', country: 'Russia', type: 'SOVEREIGN_NON_OPEC' },
      { id: deterministicId('supp', 5), name: 'Kuwait', country: 'Kuwait', type: 'SOVEREIGN_OPEC' },
      { id: deterministicId('supp', 6), name: 'United States', country: 'United States', type: 'MARKET_PRODUCER' }
    ];
    for (const s of suppliers) {
      await client.query(`INSERT INTO suppliers (id, name, country, supplier_type) VALUES ($1, $2, $3, $4)`, 
        [s.id, s.name, s.country, s.type]);
    }

    // 4. SEED FACILITIES
    console.log('Seeding Facilities...');
    const facilities = [
      // Origins
      { id: deterministicId('fac', 1), name: 'Ras Tanura Terminal', type: 'EXPORT_TERMINAL', country: 'Saudi Arabia', region: 'Persian Gulf', capacity: 6500000 },
      { id: deterministicId('fac', 2), name: 'Basrah Oil Terminal', type: 'EXPORT_TERMINAL', country: 'Iraq', region: 'Persian Gulf', capacity: 3300000 },
      { id: deterministicId('fac', 3), name: 'Fujairah / Jebel Dhanna', type: 'EXPORT_TERMINAL', country: 'UAE', region: 'Gulf of Oman', capacity: 2500000 },
      { id: deterministicId('fac', 4), name: 'Novorossiysk Terminal', type: 'EXPORT_TERMINAL', country: 'Russia', region: 'Black Sea', capacity: 1500000 },
      { id: deterministicId('fac', 5), name: 'Mina Al Ahmadi', type: 'EXPORT_TERMINAL', country: 'Kuwait', region: 'Persian Gulf', capacity: 2000000 },
      { id: deterministicId('fac', 6), name: 'US Gulf Coast Terminal', type: 'EXPORT_TERMINAL', country: 'United States', region: 'Gulf Coast', capacity: 4000000 },
      // Destinations
      { id: deterministicId('fac', 7), name: 'Jamnagar Refinery Complex', type: 'COMMERCIAL_REFINERY', country: 'India', region: 'West Coast', capacity: 1240000 },
      { id: deterministicId('fac', 8), name: 'Visakhapatnam Refinery & SPR', type: 'STRATEGIC_RESERVE', country: 'India', region: 'East Coast', capacity: 1330000 },
      { id: deterministicId('fac', 9), name: 'Mangalore Refinery & SPR', type: 'STRATEGIC_RESERVE', country: 'India', region: 'West Coast', capacity: 1500000 }
    ];
    for (const f of facilities) {
      await client.query(`INSERT INTO facilities (id, name, facility_type, country, region, capacity) VALUES ($1, $2, $3, $4, $5, $6)`, 
        [f.id, f.name, f.type, f.country, f.region, f.capacity]);
    }

    // 5. SEED CORRIDORS
    console.log('Seeding Corridors...');
    const corridors = [
      { id: deterministicId('corr', 1), name: 'Strait of Hormuz', type: 'MARITIME_CHOKEPOINT', origin: 'Persian Gulf', destination: 'Arabian Sea', capacity: 21000000 },
      { id: deterministicId('corr', 2), name: 'Red Sea / Bab-el-Mandeb', type: 'MARITIME_CHOKEPOINT', origin: 'Red Sea', destination: 'Gulf of Aden', capacity: 6200000 },
      { id: deterministicId('corr', 3), name: 'Saudi Petroline (East-West bypass)', type: 'PIPELINE', origin: 'Eastern Province', destination: 'Yanbu (Red Sea)', capacity: 5000000 },
      { id: deterministicId('corr', 4), name: 'Cape of Good Hope Route', type: 'MARITIME_OPEN_OCEAN', origin: 'Atlantic', destination: 'Indian Ocean', capacity: 50000000 },
      { id: deterministicId('corr', 5), name: 'Suez Canal Route', type: 'MARITIME_CHOKEPOINT', origin: 'Mediterranean', destination: 'Red Sea', capacity: 5500000 }
    ];
    for (const c of corridors) {
      await client.query(`INSERT INTO corridors (id, name, corridor_type, origin, destination, capacity) VALUES ($1, $2, $3, $4, $5, $6)`, 
        [c.id, c.name, c.type, c.origin, c.destination, c.capacity]);
    }

    // 6. SEED SUPPLY FLOWS
    console.log('Seeding Supply Flows...');
    const flows = [
      // Saudi Arabia -> Ras Tanura -> Hormuz -> Jamnagar
      { id: deterministicId('flow', 1), supp: deterministicId('supp', 1), orig: deterministicId('fac', 1), dest: deterministicId('fac', 7), corr: deterministicId('corr', 1), cap: 800000, base: 750000 },
      // Iraq -> Basrah -> Hormuz -> Jamnagar
      { id: deterministicId('flow', 2), supp: deterministicId('supp', 2), orig: deterministicId('fac', 2), dest: deterministicId('fac', 7), corr: deterministicId('corr', 1), cap: 600000, base: 500000 },
      // UAE -> Fujairah -> Cape (Alternative to Hormuz) -> Mangalore
      { id: deterministicId('flow', 3), supp: deterministicId('supp', 3), orig: deterministicId('fac', 3), dest: deterministicId('fac', 9), corr: deterministicId('corr', 4), cap: 400000, base: 300000 },
      // Russia -> Novorossiysk -> Suez -> Visakhapatnam
      { id: deterministicId('flow', 4), supp: deterministicId('supp', 4), orig: deterministicId('fac', 4), dest: deterministicId('fac', 8), corr: deterministicId('corr', 5), cap: 300000, base: 250000 },
      // USA -> US Gulf Coast -> Cape -> Jamnagar
      { id: deterministicId('flow', 5), supp: deterministicId('supp', 6), orig: deterministicId('fac', 6), dest: deterministicId('fac', 7), corr: deterministicId('corr', 4), cap: 250000, base: 200000 },
      // Kuwait -> Mina Al Ahmadi -> Hormuz -> Mangalore
      { id: deterministicId('flow', 6), supp: deterministicId('supp', 5), orig: deterministicId('fac', 5), dest: deterministicId('fac', 9), corr: deterministicId('corr', 1), cap: 200000, base: 180000 }
    ];
    for (const f of flows) {
      await client.query(`INSERT INTO supply_flows (id, supplier_id, origin_facility_id, destination_facility_id, corridor_id, commodity, capacity, baseline_volume) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
        [f.id, f.supp, f.orig, f.dest, f.corr, 'CRUDE_OIL', f.cap, f.base]);
    }

    // 7. SEED EVENTS
    console.log('Seeding Events...');
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 86400000);
    const events = [
      { id: deterministicId('evt', 1), title: 'Strait of Hormuz Shipping Disruption Risk', desc: 'SIMULATED: Elevated risk of blockade affecting crude transit.', type: 'GEOPOLITICAL', severity: 'CRITICAL', status: 'OPEN', occ: oneDayAgo, det: now, reg: 'Persian Gulf' },
      { id: deterministicId('evt', 2), title: 'Red Sea / Bab-el-Mandeb Escalation', desc: 'SIMULATED: Security incidents causing diversion of tanker traffic.', type: 'SECURITY', severity: 'WARNING', status: 'OPEN', occ: oneDayAgo, det: now, reg: 'Red Sea' },
      { id: deterministicId('evt', 3), title: 'Rising War-Risk Premium on Persian Gulf Tankers', desc: 'SIMULATED: Insurance premiums spiking for vessels transiting the Gulf.', type: 'MARKET', severity: 'WARNING', status: 'ANALYZED', occ: oneDayAgo, det: now, reg: 'Persian Gulf' },
      { id: deterministicId('evt', 4), title: 'Potential Ras Tanura Terminal Disruption', desc: 'SIMULATED: Unconfirmed reports of infrastructure threat.', type: 'INFRASTRUCTURE', severity: 'CRITICAL', status: 'OPEN', occ: oneDayAgo, det: now, reg: 'Saudi Arabia' }
    ];
    for (const e of events) {
      await client.query(`INSERT INTO events (id, title, description, event_type, severity, status, occurred_at, detected_at, affected_region) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
        [e.id, e.title, e.desc, e.type, e.severity, e.status, e.occ, e.det, e.reg]);
    }

    // 8. SEED EVIDENCE
    console.log('Seeding Evidence...');
    const evidence = [
      { id: deterministicId('evd', 1), ev: deterministicId('evt', 1), type: 'DEMONSTRATION', name: 'AegisGrid Scenario Dataset', ref: 'SYNTHETIC_DATA_001', content: 'DEMONSTRATION / SYNTHETIC DATA: Simulated shipping intelligence indicating a 40% reduction in vessel traffic through Hormuz over the last 24h.' },
      { id: deterministicId('evd', 2), ev: deterministicId('evt', 1), type: 'DEMONSTRATION', name: 'AegisGrid Scenario Dataset', ref: 'SYNTHETIC_DATA_002', content: 'DEMONSTRATION / SYNTHETIC DATA: Simulated government statement advising re-routing of flagged vessels.' },
      { id: deterministicId('evd', 3), ev: deterministicId('evt', 2), type: 'DEMONSTRATION', name: 'AegisGrid Scenario Dataset', ref: 'SYNTHETIC_DATA_003', content: 'DEMONSTRATION / SYNTHETIC DATA: Synthetic AIS anomaly report showing tankers holding position south of the Red Sea.' }
    ];
    for (const e of evidence) {
      await client.query(`INSERT INTO evidence (id, event_id, source_type, source_name, source_reference, content, published_at, retrieved_at, confidence) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
        [e.id, e.ev, e.type, e.name, e.ref, e.content, oneDayAgo, now, 0.95]);
    }

    // 9. SEED AI ANALYSIS & RISK ASSESSMENTS
    console.log('Seeding Analysis & Risks...');
    const analyses = [
      { id: deterministicId('ana', 1), ev: deterministicId('evt', 1), struct: { affected_corridor: "Strait of Hormuz", affected_suppliers: ["Saudi Arabia", "Iraq", "Kuwait"], supply_exposure: "High", key_risk_mechanism: "Chokepoint Closure", uncertainty: "Moderate" } }
    ];
    for (const a of analyses) {
      await client.query(`INSERT INTO ai_analysis (id, event_id, model_name, model_version, structured_output, confidence) VALUES ($1, $2, $3, $4, $5, $6)`, 
        [a.id, a.ev, 'DEMONSTRATION MODEL', 'demo-1.0', JSON.stringify(a.struct), 0.88]);
    }

    const risks = [
      { id: deterministicId('rsk', 1), ev: deterministicId('evt', 1), prob: 0.75, sev: 0.90, exp: 0.85, conf: 0.80, lvl: 'CRITICAL', basis: 'DEMONSTRATION: Evaluated based on synthetic AIS diversion data and scenario models.' }
    ];
    for (const r of risks) {
      await client.query(`INSERT INTO risk_assessments (id, event_id, probability, severity, exposure, confidence, risk_level, assessment_basis, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
        [r.id, r.ev, r.prob, r.sev, r.exp, r.conf, r.lvl, r.basis, deterministicId('user', 1)]);
    }

    // 10. SEED SCENARIOS
    console.log('Seeding Scenarios...');
    const scenarios = [
      { id: deterministicId('scn', 1), ev: deterministicId('evt', 1), name: 'Prolonged Actuarial Blockade', desc: 'SIMULATION SCENARIO: Sustained Hormuz disruption, Iraqi supply drops, Saudi supply partially rerouted.', status: 'EVALUATING' },
      { id: deterministicId('scn', 2), ev: deterministicId('evt', 2), name: 'Red Sea Contagion & Dual Chokepoint Failure', desc: 'SIMULATION SCENARIO: Simultaneous Hormuz and Bab-el-Mandeb disruptions.', status: 'DRAFT' },
      { id: deterministicId('scn', 3), ev: deterministicId('evt', 4), name: 'Targeted Kinetic Terminal Damage', desc: 'SIMULATION SCENARIO: Ras Tanura disruption with Hormuz open.', status: 'DRAFT' }
    ];
    for (const s of scenarios) {
      await client.query(`INSERT INTO scenarios (id, event_id, name, description, status, start_time, end_time, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
        [s.id, s.ev, s.name, s.desc, s.status, now, new Date(now.getTime() + 30*86400000), deterministicId('user', 2)]);
    }

    const assumptions = [
      { id: deterministicId('asm', 1), scn: deterministicId('scn', 1), param: 'Disruption Duration', type: 'TIME', val: '60', unit: 'days' },
      { id: deterministicId('asm', 2), scn: deterministicId('scn', 1), param: 'Hormuz Availability', type: 'CAPACITY_PERCENT', val: '0', unit: '%' },
      { id: deterministicId('asm', 3), scn: deterministicId('scn', 1), param: 'Saudi Petroline Rerouting', type: 'CAPACITY_PERCENT', val: '80', unit: '%' }
    ];
    for (const a of assumptions) {
      await client.query(`INSERT INTO scenario_assumptions (id, scenario_id, parameter_name, parameter_type, parameter_value, unit, source, confidence) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
        [a.id, a.scn, a.param, a.type, a.val, a.unit, 'DEMONSTRATION MODEL', 0.9]);
    }

    // 11. SEED NETWORK SNAPSHOT (Required for Evaluation)
    console.log('Seeding Network Snapshot & Evaluation...');
    const snapshotId = deterministicId('snp', 1);
    await client.query(`INSERT INTO network_snapshots (id, created_by, description, snapshot_data) VALUES ($1, $2, $3, $4)`, 
      [snapshotId, deterministicId('user', 1), 'Baseline network state before scenario', JSON.stringify({
        expected_shortfall: 500000,
        affected_capacity: 1500000,
        affected_flow_ids: [deterministicId('flow', 1), deterministicId('flow', 2), deterministicId('flow', 6)],
        suppliers,
        facilities,
        corridors,
        supply_flows: flows
      })]);

    const evalId = deterministicId('evl', 1);
    await client.query(`INSERT INTO scenario_evaluations (id, scenario_id, network_snapshot_id, risk_assessment_id, status, engine_version, completed_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
      [evalId, deterministicId('scn', 1), snapshotId, deterministicId('rsk', 1), 'COMPLETED', 'demo-1.0', now]);

    await client.query(`INSERT INTO simulation_results (id, evaluation_id, available_supply, affected_capacity, shortfall, reserve_level, calculation_version) VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
      [deterministicId('sim', 1), evalId, 2000000, 1500000, 500000, 800000, 'demo-1.0']);

    await client.query(`INSERT INTO impact_assessments (id, evaluation_id, supply_impact, economic_impact, operational_impact, reserve_impact, resilience_impact, overall_impact, calculation_version) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
      [deterministicId('imp', 1), evalId, 0.8, 0.9, 0.7, 0.6, 0.5, 0.75, 'demo-1.0']);

    // 12. SEED RESPONSE CANDIDATES & SCORES
    console.log('Seeding Response Candidates...');
    const responses = [
      { id: deterministicId('rsp', 1), type: 'RESERVE_DRAWDOWN', name: 'ISPRL Phase I Emergency Drawdown', desc: 'Draw down from Visakhapatnam and Mangalore strategic reserves to offset shortfall.', params: { drawdown_rate: 100000 }, feasible: true },
      { id: deterministicId('rsp', 2), type: 'ROUTE_OPTIMIZATION', name: 'Saudi Petroline Optimization', desc: 'Maximize crude flow through the East-West pipeline to bypass Hormuz.', params: { additional_flow: 300000 }, feasible: true },
      { id: deterministicId('rsp', 3), type: 'PROCUREMENT_SHIFT', name: 'Increase Russian Cape-route procurement', desc: 'Secure additional spot cargoes from Russia routed via Cape of Good Hope.', params: { additional_volume: 150000 }, feasible: true },
      { id: deterministicId('rsp', 4), type: 'PROCUREMENT_SHIFT', name: 'Increase US Gulf Coast spot procurement', desc: 'Buy emergency US crude.', params: { additional_volume: 500000 }, feasible: false } // Infeasible due to constraint
    ];
    for (const r of responses) {
      await client.query(`INSERT INTO response_candidates (id, evaluation_id, response_type, name, description, parameters, status) VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
        [r.id, evalId, r.type, r.name, r.desc, JSON.stringify(r.params), 'EVALUATED']);
      
      await client.query(`INSERT INTO constraint_evaluations (id, response_candidate_id, feasible, violations, constraint_version) VALUES ($1, $2, $3, $4, $5)`, 
        [deterministicId('cnst', parseInt(r.id.split('-').pop()!)), r.id, r.feasible, r.feasible ? JSON.stringify([]) : JSON.stringify(['Logistics Lead Time Exceeded', 'Vessel Availability Constraint']), 'demo-1.0']);
      
      if (r.feasible) {
        await client.query(`INSERT INTO response_scores (id, response_candidate_id, overall_score, dimension_scores, weights, scoring_version) VALUES ($1, $2, $3, $4, $5, $6)`, 
          [deterministicId('scr', parseInt(r.id.split('-').pop()!)), r.id, 0.85, JSON.stringify({ speed: 0.9, cost: 0.7 }), JSON.stringify({ speed: 0.5, cost: 0.5 }), 'demo-1.0']);
        
        await client.query(`INSERT INTO ranked_responses (id, evaluation_id, response_candidate_id, rank, score, ranking_version) VALUES ($1, $2, $3, $4, $5, $6)`, 
          [deterministicId('rnk', parseInt(r.id.split('-').pop()!)), evalId, r.id, parseInt(r.id.split('-').pop()!), 0.85, 'demo-1.0']);
      }
    }

    // 13. SEED RECOMMENDATIONS
    console.log('Seeding Recommendations & Decisions...');
    const recId = deterministicId('rec', 1);
    await client.query(`INSERT INTO recommendations (id, evaluation_id, response_candidate_id, rank, score, rationale, tradeoffs, uncertainty, confidence) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`, 
      [recId, evalId, deterministicId('rsp', 2), 1, 0.92, 'Prioritize Saudi Petroline Optimization with controlled strategic reserve support.', JSON.stringify(['Cost vs Lead Time']), JSON.stringify(['Vessel insurance premium volatility']), 0.88]);

    // 14. SEED HUMAN DECISIONS & AUDIT
    const decId = deterministicId('dec', 1);
    await client.query(`INSERT INTO human_decisions (id, recommendation_id, decision_type, selected_response_id, modification_notes, reason, decided_by) VALUES ($1, $2, $3, $4, $5, $6, $7)`, 
      [decId, recId, 'MODIFY', deterministicId('rsp', 2), 'Limit strategic reserve drawdown until alternative cargo arrivals are confirmed.', 'Authorize the rerouting strategy.', deterministicId('user', 3)]);

    await client.query(`INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, before_state, after_state, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, 
      [deterministicId('aud', 1), deterministicId('user', 3), 'DECISION_CREATED', 'HUMAN_DECISION', decId, null, JSON.stringify({ decision_type: 'MODIFY' }), JSON.stringify({ note: 'Demo Decision Audit' })]);

    await client.query('COMMIT');
    console.log('Seed operation completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seed operation failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
