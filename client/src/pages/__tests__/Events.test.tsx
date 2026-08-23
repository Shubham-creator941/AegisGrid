import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Events from '../Events';
import * as useEventsModule from '../../features/events/hooks/useEvents';

vi.mock('../../features/events/hooks/useEvents', () => ({
  useEventsList: vi.fn(),
}));

// Mock sub-components so we only test the Events container logic
vi.mock('../../features/events/components/EventDetail', () => ({
  EventDetail: ({ event }: any) => <div data-testid="event-detail">{event.title}</div>
}));
vi.mock('../../features/events/components/EvidenceList', () => ({
  EvidenceList: () => <div data-testid="evidence-list">Evidence List</div>
}));
vi.mock('../../features/analysis/components/AnalysisWorkspace', () => ({
  AnalysisWorkspace: () => <div data-testid="analysis-workspace">Analysis Workspace</div>
}));

describe('Events Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    vi.spyOn(useEventsModule, 'useEventsList').mockReturnValue({
      data: [],
      loading: true,
      error: null,
    });

    const { container } = render(<Events />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders error state', () => {
    vi.spyOn(useEventsModule, 'useEventsList').mockReturnValue({
      data: [],
      loading: false,
      error: 'Network Error',
    });

    render(<Events />);
    expect(screen.getByText('Unable to load events')).toBeInTheDocument();
    expect(screen.getByText(/Network Error/)).toBeInTheDocument();
  });

  it('renders empty state', () => {
    vi.spyOn(useEventsModule, 'useEventsList').mockReturnValue({
      data: [],
      loading: false,
      error: null,
    });

    render(<Events />);
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

    render(<Events />);

    // Check list rendered
    expect(screen.getByText('Test Event 1')).toBeInTheDocument();
    expect(screen.getByText('Test Event 2')).toBeInTheDocument();

    // Select an event
    fireEvent.click(screen.getByText('Test Event 1'));

    // Check detail rendered
    expect(screen.getByTestId('event-detail')).toHaveTextContent('Test Event 1');
    expect(screen.getByTestId('analysis-workspace')).toBeInTheDocument(); // Default tab

    // Switch tabs
    fireEvent.click(screen.getByText('Evidence Log'));
    expect(screen.getByTestId('evidence-list')).toBeInTheDocument();
    expect(screen.queryByTestId('analysis-workspace')).not.toBeInTheDocument();
  });
});
