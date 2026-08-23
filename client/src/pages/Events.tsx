import { useEffect, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, ChevronRight, Eye, Search, ShieldAlert } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { EventWorkspace } from '../features/events/components/EventWorkspace';
import { useEventsList } from '../features/events/hooks/useEvents';
import type { Event } from '../features/events/api/events.api';

export default function Events() {
  const { data: events, loading, error } = useEventsList();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(searchParams.get('eventId') || undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const detailScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (events.length && !events.some(event => event.id === selectedEventId)) setSelectedEventId(events[0].id);
  }, [events, selectedEventId]);

  useEffect(() => {
    if (detailScrollRef.current) detailScrollRef.current.scrollTop = 0;
  }, [selectedEventId]);

  const selectedEvent = events.find(event => event.id === selectedEventId) || events[0];
  const query = searchQuery.trim().toLowerCase();
  const filteredEvents = events.filter(event => `${event.title} ${event.affected_region} ${event.severity}`.toLowerCase().includes(query));
  const selectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setSearchParams({ eventId }, { replace: true });
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#060B18] font-sans text-[#E6EDF7]">
      <div className="mb-4 shrink-0">
        <h1 className="mb-1 text-2xl font-semibold tracking-wide text-[#E6EDF7]">Threat &amp; Event Monitoring</h1>
        <p className="text-[13px] text-[#91A4BF]">Operational view of geopolitical and logistics disruptions.</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 min-[1100px]:flex-row xl:gap-6">
        <section className="flex min-h-[250px] max-h-[310px] w-full shrink-0 flex-col overflow-hidden rounded-xl border border-[#1E304D] bg-[#0B1224] shadow-lg min-[1100px]:max-h-none min-[1100px]:w-[29%]" aria-label="Active events">
          <div className="border-b border-[#1E304D] bg-[#0E172B] p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF7]">Active Events</h2>
              <span className="rounded border border-[#FF4545]/30 bg-[#FF4545]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#FF4545]">{events.filter(event => event.severity === 'CRITICAL').length} Critical</span>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#657994]" />
              <input aria-label="Filter events" placeholder="Filter events..." value={searchQuery} onChange={event => setSearchQuery(event.target.value)} className="w-full rounded border border-[#1E304D] bg-[#060B18] py-2 pl-9 pr-3 text-xs text-[#E6EDF7] placeholder-[#657994] focus:border-[#2F8CFF]/50 focus:outline-none" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <div className="space-y-2 p-4" aria-label="Loading events">{[1, 2, 3].map(item => <div key={item} className="h-24 animate-pulse rounded bg-[#121D34]" />)}</div>}
            {!loading && error && <div className="m-4 rounded-lg border border-[#FF4545]/30 bg-[#FF4545]/10 p-4 text-sm text-[#FF7777]"><div className="flex items-center gap-2 font-semibold"><AlertCircle size={16} />Unable to load events</div><p className="mt-1 text-xs text-[#91A4BF]">Operational event data is temporarily unavailable. Reference: {error}</p></div>}
            {!loading && !error && !events.length && <div className="p-8 text-center text-sm text-[#657994]">No active events</div>}
            {!loading && !error && events.length > 0 && !filteredEvents.length && <div className="p-8 text-center text-sm text-[#657994]">No events match this filter.</div>}
            {filteredEvents.map(event => <EventRow key={event.id} event={event} selected={event.id === selectedEvent?.id} onSelect={() => selectEvent(event.id)} />)}
          </div>
        </section>
        <section ref={detailScrollRef} className="min-h-[560px] w-full flex-1 overflow-y-auto rounded-xl border border-[#1E304D] bg-[#0B1224] p-4 shadow-lg md:p-5 xl:p-6" aria-label="Selected event workspace">
          {selectedEvent ? <EventWorkspace event={selectedEvent} /> : !loading && !error ? <div className="flex h-full items-center justify-center text-sm text-[#657994]">Select an event to inspect its operational analysis.</div> : null}
        </section>
      </div>
    </div>
  );
}

function EventRow({ event, selected, onSelect }: { event: Event; selected: boolean; onSelect: () => void }) {
  const critical = event.severity === 'CRITICAL';
  const elevated = event.severity === 'ELEVATED' || event.severity === 'WARNING';
  const Icon = critical ? ShieldAlert : elevated ? AlertTriangle : Eye;
  const severityColor = critical ? 'text-[#FF4545]' : elevated ? 'text-[#FFB000]' : 'text-[#6CA8FF]';
  const accent = critical ? 'border-l-[#FF4545]' : elevated ? 'border-l-[#FFB000]' : 'border-l-[#57789F]';
  const detected = new Date(event.detected_at).toLocaleDateString('en-GB');
  return <button onClick={onSelect} className={`relative flex w-full flex-col gap-2 border-b border-l-[3px] border-b-[#1E304D] p-4 text-left transition-colors hover:bg-[#121D34] ${selected ? `bg-[#121D34]/80 ${accent}` : 'border-l-transparent'}`}>
    <div className="flex items-start justify-between gap-2"><span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${severityColor}`}><Icon size={14} />{event.severity}</span><span className="rounded border border-[#1E304D] bg-[#1E304D]/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#91A4BF]">{event.status}</span></div>
    <div className="flex items-start justify-between gap-3"><span className="text-sm font-semibold leading-tight text-[#E6EDF7]">{event.title}</span>{selected && <ChevronRight size={16} className="mt-0.5 shrink-0 text-[#657994]" />}</div>
    <div className="flex items-center justify-between gap-3 text-xs text-[#91A4BF]"><span className="min-w-0 truncate">{event.affected_region}</span><span className="shrink-0">{detected}</span></div>
  </button>;
}
