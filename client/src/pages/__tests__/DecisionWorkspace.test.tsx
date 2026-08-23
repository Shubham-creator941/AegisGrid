import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DecisionWorkspace from '../DecisionWorkspace';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

describe('DecisionWorkspace Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use globalThis.fetch (cross-environment) instead of global.fetch (Node-only)
    vi.stubGlobal('fetch', vi.fn());
    Storage.prototype.getItem = vi.fn(() => 'mock-token');
  });

  const renderComponent = (scenarioId = '123') => {
    return render(
      <MemoryRouter initialEntries={[`/scenarios/${scenarioId}/decision`]}>
        <Routes>
          <Route path="/scenarios/:scenarioId/decision" element={<DecisionWorkspace />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state initially', () => {
    vi.mocked(globalThis.fetch).mockImplementation(() => new Promise(() => {})); // Never resolves
    renderComponent();
    expect(screen.getByText('Running Evaluation Engine...')).toBeInTheDocument();
  });

  it('renders error state if fetch fails', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network failure'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Error: Network failure/)).toBeInTheDocument();
    });
  });

  it('renders evaluation data successfully', async () => {
    const mockData = {
      data: {
        result: {
          impact: { supply_impact: 8.5, economic_impact: 4.2, operational_impact: 6.0, overall_impact: 7.1 },
          responses: [{ id: 'resp1', name: 'Reroute Cargo', response_type: 'LOGISTICS' }],
          constraints: [{ response_candidate_id: 'resp1', feasible: true, violations: [] }],
          scores: [{ response_candidate_id: 'resp1', overall_score: 9.5 }],
          ranking: [{ rank: 1, candidate: { id: 'resp1' } }],
          recommendation: {
            id: 'rec1',
            response_candidate_id: 'resp1',
            rationale: 'Best option available.',
            tradeoffs: ['Cost increase'],
            confidence: 0.95
          }
        }
      }
    };

    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Decision Workspace (Phase 6)')).toBeInTheDocument();
      expect(screen.getByText('System Recommendation')).toBeInTheDocument();
      expect(screen.getAllByText('Reroute Cargo').length).toBeGreaterThan(0);
    });
  });

  it('handles decision workflow', async () => {
    const mockData = {
      data: {
        result: {
          impact: { supply_impact: 8.5, economic_impact: 4.2, operational_impact: 6.0, overall_impact: 7.1 },
          responses: [{ id: 'resp1', name: 'Reroute Cargo', response_type: 'LOGISTICS' }],
          constraints: [{ response_candidate_id: 'resp1', feasible: true, violations: [] }],
          scores: [{ response_candidate_id: 'resp1', overall_score: 9.5 }],
          ranking: [{ rank: 1, candidate: { id: 'resp1' } }],
          recommendation: {
            id: 'rec1',
            response_candidate_id: 'resp1',
            rationale: 'Best option available.',
            tradeoffs: ['Cost increase'],
            confidence: 0.95
          }
        }
      }
    };

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Human Decision')).toBeInTheDocument();
    });

    // Mock the subsequent fetch for the decision submission
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'dec1', decision_type: 'ACCEPT', reason: 'Accepted by user' })
    } as any);

    // Click Accept
    fireEvent.click(screen.getByText('ACCEPT'));

    await waitFor(() => {
      expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Decision Recorded: ACCEPT')).toBeInTheDocument();
    });
  });

  it('enforces rationale for REJECT and MODIFY', async () => {
    const mockData = {
      data: {
        result: {
          impact: { supply_impact: 8.5, economic_impact: 4.2, operational_impact: 6.0, overall_impact: 7.1 },
          responses: [{ id: 'resp1', name: 'Reroute Cargo', response_type: 'LOGISTICS' }],
          constraints: [{ response_candidate_id: 'resp1', feasible: true, violations: [] }],
          scores: [{ response_candidate_id: 'resp1', overall_score: 9.5 }],
          ranking: [{ rank: 1, candidate: { id: 'resp1' } }],
          recommendation: {
            id: 'rec1',
            response_candidate_id: 'resp1',
            rationale: 'Best option available.',
            tradeoffs: ['Cost increase'],
            confidence: 0.95
          }
        }
      }
    };

    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockData)
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Human Decision')).toBeInTheDocument();
    });

    // Try to reject without rationale
    fireEvent.click(screen.getByText('REJECT'));

    await waitFor(() => {
      expect(screen.getByText('Error: Reason is required for MODIFY and REJECT')).toBeInTheDocument();
      expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledTimes(1); // No new call made
    });
  });
});
