import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Events from '../Events';
import * as useEventsModule from '../../features/events/hooks/useEvents';

vi.mock('../../features/events/hooks/useEvents', () => ({
  useEventsList: vi.fn(),
}));

// Mock sub-components so we only test the Events container logic
vi.mock('../../features/events/components/EventDetail', () => ({
  EventDetail: ({ event }: any) => <div data-testid="event-detail">{event.title}</div>
}));
vi.mock('../../features/events/components/EventWorkspace', () => ({
  EventWorkspace: ({ event }: any) => <div data-testid="event-workspace">{event.title}</div>
}));
vi.mock('../../features/events/components/EvidenceList', () => ({
  EvidenceList: () => <div data-testid="evidence-list">Evidence List</div>
}));
vi.mock('../../features/analysis/components/AnalysisWorkspace', () => ({
  AnalysisWorkspace: () => <div data-testid="analysis-workspace">Analysis Workspace</div>
}));

describe('Events Page', () => {
  const renderEvents = () => render(<MemoryRouter><Events /></MemoryRouter>);
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    vi.spyOn(useEventsModule, 'useEventsList').mockReturnValue({
      data: [],
      loading: true,
      error: null,
    });

    const { container } = renderEvents();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders error state', () => {
    vi.spyOn(useEventsModule, 'useEventsList').mockReturnValue({
      data: [],
      loading: false,
      error: 'Network Error',
    });

    renderEvents();
    expect(screen.getByText('Unable to load events')).toBeInTheDocument();
    expect(screen.getByText(/Network Error/)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    vi.spyOn(useEventsModule, 'useEventsList').mockReturnValue({
      data: [],
      loading: false,
      error: null,
    });

    renderEvents();
    expect(screen.getByText('No active events')).toBeInTheDocument();
  });

  it('renders events list and selects an event', () => {
    const mockEvents = [
      { id: '1', title: 'Test Event 1', severity: 'CRITICAL', status: 'OPEN', detected_at: '2026-01-01T00:00:00Z', affected_region: 'Global' },
      { id: '2', title: 'Test Event 2', severity: 'WARNING', status: 'IN_PROGRESS', detected_at: '2026-01-02T00:00:00Z', affected_region: 'Local' }
    ];

    vi.spyOn(useEventsModule, 'useEventsList').mockReturnValue({
      data: mockEvents as any,
      loading: false,
      error: null,
    });

    renderEvents();

    // Check list rendered
    expect(screen.getAllByText('Test Event 1')).toHaveLength(2);
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();

    // Select an event
    fireEvent.click(screen.getByRole('button', { name: /Test Event 1/ }));

    // Check detail rendered
    expect(screen.getByTestId('event-workspace')).toHaveTextContent('Test Event 1');

    fireEvent.click(screen.getByRole('button', { name: /Test Event 2/ }));
    expect(screen.getByTestId('event-workspace')).toHaveTextContent('Test Event 2');
  });
});
