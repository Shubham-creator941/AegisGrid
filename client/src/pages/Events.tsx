import { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  AlertCircle, 
  ChevronRight, 
  Box,
  FileText
} from 'lucide-react';
import { useEventsList } from '../features/events/hooks/useEvents';
import { EventDetail } from '../features/events/components/EventDetail';
import { EvidenceList } from '../features/events/components/EvidenceList';
import { AnalysisWorkspace } from '../features/analysis/components/AnalysisWorkspace';
import { BrainCircuit } from 'lucide-react';
const format = (date: Date, _fmt?: string) => date.toLocaleDateString();
import type { Event } from '../features/events/api/events.api';

export default function Events() {
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<'EVIDENCE' | 'ANALYSIS'>('ANALYSIS');
  const { data: events, loading, error } = useEventsList();

  const getSeverityConfig = (severity: string) => {
    const s = severity.toUpperCase();
    if (s === 'CRITICAL') return { color: 'text-red-400', icon: <ShieldAlert size={14} className="text-red-400" /> };
    if (s === 'WARNING') return { color: 'text-amber-400', icon: <AlertTriangle size={14} className="text-amber-400" /> };
    if (s === 'MONITORING') return { color: 'text-blue-400', icon: <Eye size={14} className="text-blue-400" /> };
    return { color: 'text-slate-400', icon: <AlertCircle size={14} className="text-slate-400" /> };
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="h-full flex flex-col w-full">
      <div className="mb-6 px-4 pt-2">
        <h1 className="text-xl font-semibold text-slate-200">Threat & Event Monitoring</h1>
        <p className="text-sm text-slate-500 mt-1">Operational view of geopolitical and logistics disruptions.</p>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-6">
        
        {/* Master List Column */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-slate-800/30">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Active Events</h2>
            <input 
              type="text" 
              placeholder="Filter events..."
              disabled
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-slate-500 disabled:opacity-50"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex flex-col gap-2 p-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-slate-800 animate-pulse rounded border border-slate-700"></div>
                ))}
              </div>
            )}
            
            {error && (
              <div className="p-4 text-sm text-red-400 flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Unable to load events</div>
                  <div className="text-xs opacity-80">Event monitoring data could not be retrieved. ({error})</div>
                </div>
              </div>
            )}

            {!loading && !error && events.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-sm text-slate-300 font-medium">No active events</p>
                <p className="text-xs text-slate-500 mt-2">No geopolitical or logistics events are currently available for investigation.</p>
              </div>
            )}

            {!loading && !error && events.map((ev: Event) => {
              const sev = getSeverityConfig(ev.severity);
              return (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors flex flex-col gap-2 ${
                    selectedEventId === ev.id ? 'bg-slate-800/80 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      {sev.icon}
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${sev.color}`}>
                        {ev.severity}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded font-semibold border border-slate-700 uppercase">
                      {ev.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-200 line-clamp-1 pr-2">{ev.title}</span>
                    <ChevronRight size={16} className="text-slate-600 shrink-0" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
                    <span className="line-clamp-1">{ev.affected_region || 'Unknown Location'}</span>
                    <span className="shrink-0">{ev.detected_at ? format(new Date(ev.detected_at)) : '-'}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden relative flex flex-col">
          {!selectedEvent ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Box size={48} className="mb-4 opacity-50" />
              <p>Select an event from the list to investigate.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-6 border-b border-slate-800 bg-slate-900/50 shrink-0">
                <EventDetail event={selectedEvent} />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
                <div className="flex items-center gap-6 border-b border-slate-800 mb-6 pb-2">
                  <button 
                    onClick={() => setActiveTab('EVIDENCE')}
                    className={`flex items-center gap-2 pb-2 -mb-[9px] border-b-2 font-semibold text-sm transition-colors ${activeTab === 'EVIDENCE' ? 'border-blue-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    <FileText size={16} />
                    Evidence Log
                  </button>
                  <button 
                    onClick={() => setActiveTab('ANALYSIS')}
                    className={`flex items-center gap-2 pb-2 -mb-[9px] border-b-2 font-semibold text-sm transition-colors ${activeTab === 'ANALYSIS' ? 'border-purple-500 text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    <BrainCircuit size={16} />
                    AI Analysis & Risk
                  </button>
                </div>
                
                {activeTab === 'EVIDENCE' ? (
                  <EvidenceList eventId={selectedEvent.id} />
                ) : (
                  <AnalysisWorkspace event={selectedEvent} />
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
