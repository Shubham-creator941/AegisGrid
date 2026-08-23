import { USE_DEMO_DATA } from '../config/demo.config';
import * as demoData from './demoData';
import type { AxiosInstance } from 'axios';

export function setupDemoAdapter(client: AxiosInstance) {
  if (!USE_DEMO_DATA) return;

  const originalAdapter = client.defaults.adapter;

  // @ts-ignore - overriding internal axios adapter
  client.defaults.adapter = async (config) => {
    const url = config.url || '';
    const method = config.method?.toLowerCase();

    // Helper to wrap response
    const respond = (status: number, data: any) => {
      return {
        data,
        status,
        statusText: 'OK',
        headers: {},
        config,
        request: {}
      };
    };

    if (url.includes('/api/v1/suppliers') && method === 'get') {
      return respond(200, { success: true, data: demoData.mockSuppliers, meta: { total: 4 } });
    }
    if (url.includes('/api/v1/facilities') && method === 'get') {
      return respond(200, { success: true, data: demoData.mockFacilities, meta: { total: 7 } });
    }
    if (url.includes('/api/v1/corridors') && method === 'get') {
      return respond(200, { success: true, data: demoData.mockCorridors, meta: { total: 3 } });
    }
    if (url.includes('/api/v1/supply-flows') && method === 'get') {
      return respond(200, { success: true, data: demoData.mockSupplyFlows, meta: { total: 3 } });
    }

    // Events
    if (url.match(/\/api\/v1\/events\/.+\/evidence/) && method === 'get') {
      return respond(200, { success: true, data: demoData.mockEvidence, meta: { total: 1 } });
    }
    if (url.match(/\/api\/v1\/events\/.+\/analysis/) && method === 'get') {
      return respond(200, demoData.mockAnalysis);
    }
    if (url.match(/\/api\/v1\/events\/.+\/risk-assessments/) && method === 'get') {
      return respond(200, demoData.mockRiskAssessment);
    }
    if (url.match(/\/api\/v1\/events\/.+\/analyze/) && method === 'post') {
      return respond(200, demoData.mockAnalysis);
    }
    if (url.includes('/api/v1/events') && method === 'get') {
      return respond(200, { success: true, data: demoData.mockEvents, meta: { total: 1 } });
    }

    // Scenarios
    if (url.match(/\/api\/v1\/scenarios\/.+\/evaluate/) && method === 'post') {
      return respond(200, { success: true, data: { evaluation: demoData.mockEvaluation, result: demoData.mockEvaluationResult } });
    }
    if (url.includes('/api/v1/scenarios') && method === 'get') {
      return respond(200, { success: true, data: demoData.mockScenarios, meta: { total: 1 } });
    }
    if (url.includes('/api/v1/scenarios') && method === 'post') {
      // Mock creating a scenario
      const body = JSON.parse(config.data as string);
      return respond(201, {
        success: true,
        data: {
          id: `scn-${Date.now()}`,
          name: body.name,
          description: body.description,
          event_id: body.event_id,
          status: 'READY',
          scenario_version: 1,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days
          created_by: body.created_by,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    }

    // Evaluations
    if (url.match(/\/api\/v1\/evaluations\/.+\/result/) && method === 'get') {
      return respond(200, { success: true, data: demoData.mockEvaluationResult });
    }
    if (url.match(/\/api\/v1\/evaluations\/.+/) && method === 'get') {
      return respond(200, { success: true, data: demoData.mockEvaluation });
    }

    // Decisions (/api/v1/recommendations/:id/decision)
    if (url.match(/\/api\/v1\/recommendations\/.+\/decision/)) {
      const parts = url.split('/');
      const recId = parts[parts.length - 2];
      
      if (method === 'post') {
        const body = JSON.parse(config.data as string);
        const newDecision = {
          id: `dec-${Date.now()}`,
          recommendation_id: recId,
          decision_type: body.decision,
          selected_response_id: body.selected_response_id,
          reason: body.rationale,
          decided_by: 'usr-demo',
          created_at: new Date().toISOString()
        };
        demoData.mockDecisions[recId] = newDecision;
        
        demoData.mockAuditLogs.unshift({
          id: `log-${Date.now()}-2`,
          action: `DECISION_${body.decision.toUpperCase()}`,
          actor_id: 'usr-demo',
          entity_type: 'Decision',
          entity_id: newDecision.id,
          before_state: { status: 'PENDING' },
          after_state: { decision_type: body.decision, selected_response_id: body.selected_response_id, reason: body.rationale },
          metadata: { source: 'demo' },
          created_at: new Date().toISOString()
        });

        demoData.mockAuditLogs.unshift({
          id: `log-${Date.now()}-1`,
          action: 'DECISION_CREATED',
          actor_id: 'usr-demo',
          entity_type: 'Decision',
          entity_id: newDecision.id,
          before_state: null,
          after_state: { status: 'PENDING', recommendation_id: recId },
          metadata: { source: 'demo' },
          created_at: new Date(Date.now() - 1000).toISOString()
        });

        return respond(200, { success: true, data: newDecision });
      } else if (method === 'get') {
        return respond(200, { success: true, data: demoData.mockDecisions[recId] || null });
      }
    }

    // Audit
    if (url.includes('/api/v1/audit') && method === 'get') {
      return respond(200, { 
        data: demoData.mockAuditLogs, 
        meta: { total: demoData.mockAuditLogs.length, total_pages: 1, page: 1, page_size: 50 } 
      });
    }

    // Fallback to real backend if url doesn't match and we still want to allow it
    if (originalAdapter && typeof originalAdapter === 'function') {
      return originalAdapter(config);
    }

    console.warn(`[Demo Adapter] Unmocked request: ${method?.toUpperCase()} ${url}`);
    return Promise.reject(new Error(`Demo Adapter: No mock found for ${method?.toUpperCase()} ${url}`));
  };
}
