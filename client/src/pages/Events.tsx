import { useState } from 'react';
import { 
  Search, 
  ShieldAlert, 
  AlertTriangle, 
  Eye, 
  ChevronRight
} from 'lucide-react';
import { EventWorkspace } from '../features/events/components/EventWorkspace';

// --- MOCK DATA ---
const DEMO_EVENTS = [
  {
    id: 'ev-1',
    title: 'Strait of Hormuz Blockade',
    location: 'Strait of Hormuz',
    date: '23/8/2026',
    severity: 'CRITICAL',
    status: 'ANALYZED'
  },
  {
    id: 'ev-2',
    title: 'Red Sea Shipping Disruption',
    location: 'Bab-el-Mandeb',
    date: '23/8/2026',
    severity: 'ELEVATED',
    status: 'ANALYZED'
  },
  {
    id: 'ev-3',
    title: 'Taiwan Strait Transit Risk',
    location: 'Taiwan Strait',
    date: '22/8/2026',
    severity: 'MONITORING',
    status: 'ACTIVE'
  }
];

export default function Events() {
  const [selectedEventId, setSelectedEventId] = useState<string>('ev-1');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = DEMO_EVENTS.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col w-full bg-[#060B18] text-[#E6EDF7] font-sans">
      {/* PAGE HEADER */}
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl font-semibold text-[#E6EDF7] tracking-wide mb-1">Threat & Event Monitoring</h1>
        <p className="text-[13px] text-[#91A4BF]">Operational view of geopolitical and logistics disruptions.</p>
      </div>

      {/* MAIN CONTENT LAYOUT */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* LEFT COLUMN: ACTIVE EVENTS PANEL */}
        <div className="w-full lg:w-[28%] flex flex-col bg-[#0B1224] border border-[#1E304D] rounded-xl overflow-hidden shrink-0 shadow-lg">
          <div className="p-4 border-b border-[#1E304D] bg-[#0E172B]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-[#E6EDF7] uppercase tracking-wider">ACTIVE EVENTS</h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FF4545]/10 border border-[#FF4545]/30 text-[#FF4545]">
                <span className="text-[9px] font-bold uppercase tracking-wider">1 Critical</span>
              </div>
            </div>
            
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#657994]" />
              <input 
                type="text" 
                placeholder="Filter events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#060B18] border border-[#1E304D] rounded pl-9 pr-3 py-2 text-xs text-[#E6EDF7] placeholder-[#657994] focus:outline-none focus:border-[#2F8CFF]/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredEvents.map((ev) => {
              const isSelected = selectedEventId === ev.id;
              const isCritical = ev.severity === 'CRITICAL';
              const isElevated = ev.severity === 'ELEVATED';
              
              let sevColor = 'text-[#657994]';
              let Icon = Eye;
              let borderAccent = 'border-transparent';
              
              if (isCritical) {
                sevColor = 'text-[#FF4545]';
                Icon = ShieldAlert;
                borderAccent = 'border-[#FF4545]';
              } else if (isElevated) {
                sevColor = 'text-[#FFB000]';
                Icon = AlertTriangle;
                borderAccent = 'border-[#FFB000]';
              }

              return (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`w-full text-left p-4 border-b border-[#1E304D] hover:bg-[#121D34] transition-colors flex flex-col gap-2 relative ${
                    isSelected ? 'bg-[#121D34]/80 border-l-[3px] shadow-[inset_15px_0_20px_-15px_rgba(255,69,69,0.1)] ' + borderAccent : 'border-l-[3px] border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon size={14} className={sevColor} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${sevColor}`}>
                        {ev.severity}
                      </span>
                    </div>
                    {ev.status === 'ANALYZED' && (
                      <span className="text-[9px] text-[#91A4BF] bg-[#1E304D]/50 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest border border-[#1E304D]">
                        {ev.status}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm font-semibold text-[#E6EDF7] leading-tight">{ev.title}</span>
                    {isSelected && <ChevronRight size={16} className="text-[#657994] shrink-0 mt-0.5" />}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-[#91A4BF] mt-1">
                    <span className="truncate">{ev.location}</span>
                    <span className="shrink-0">{ev.date}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: EVENT DETAIL WORKSPACE */}
        <div className="w-full lg:w-[72%] bg-[#0B1224] border border-[#1E304D] rounded-xl overflow-hidden shadow-lg p-6 flex flex-col min-h-0">
          <EventWorkspace />
        </div>

      </div>
    </div>
  );
}
