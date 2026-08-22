import { AlertCircle, ShieldAlert, AlertTriangle, Eye, Clock, MapPin, Box } from 'lucide-react';
import type { Event } from '../api/events.api';
const format = (date: Date, _fmt?: string) => date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

interface EventDetailProps {
  event: Event;
}

export function EventDetail({ event }: EventDetailProps) {
  
  const getSeverityConfig = (severity: string) => {
    const s = severity.toUpperCase();
    if (s === 'CRITICAL') return { color: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-800/50', icon: <ShieldAlert size={16} className="text-red-400"/> };
    if (s === 'WARNING') return { color: 'text-amber-400', bg: 'bg-amber-900/40', border: 'border-amber-800/50', icon: <AlertTriangle size={16} className="text-amber-400"/> };
    if (s === 'MONITORING') return { color: 'text-blue-400', bg: 'bg-blue-900/40', border: 'border-blue-800/50', icon: <Eye size={16} className="text-blue-400"/> };
    return { color: 'text-slate-400', bg: 'bg-slate-800', border: 'border-slate-700', icon: <AlertCircle size={16} className="text-slate-400"/> };
  };

  const sev = getSeverityConfig(event.severity);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border ${sev.bg} ${sev.color} ${sev.border}`}>
            {sev.icon}
            {event.severity}
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            {event.status}
          </span>
        </div>
        
        <h2 className="text-2xl font-semibold text-slate-100 mb-2">{event.title}</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          {event.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <Clock size={14} />
            Detected
          </div>
          <div className="text-sm text-slate-200">
            {event.detected_at ? format(new Date(event.detected_at), 'MMM d, yyyy HH:mm') : 'Not available'}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <MapPin size={14} />
            Location
          </div>
          <div className="text-sm text-slate-200">
            {event.affected_region || 'Not available'}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded p-4 col-span-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            <Box size={14} />
            Event Type
          </div>
          <div className="text-sm text-slate-200">
            {event.event_type || 'Unknown'}
          </div>
        </div>
      </div>
    </div>
  );
}
