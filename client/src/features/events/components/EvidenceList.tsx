import { Activity, AlertCircle, ExternalLink } from 'lucide-react';
import { useEvidenceList } from '../hooks/useEvents';
const format = (date: Date, _fmt?: string) => date.toLocaleDateString();

interface EvidenceListProps {
  eventId: string;
}

export function EvidenceList({ eventId }: EvidenceListProps) {
  const { data: evidence, loading, error } = useEvidenceList(eventId);

  if (loading) {
    return (
      <div className="flex justify-center p-8 text-slate-500">
        <Activity className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 flex items-center gap-3 text-red-400">
        <AlertCircle size={20} />
        <div>
          <h3 className="text-sm font-semibold">Evidence Unavailable</h3>
          <p className="text-xs mt-1">Failed to load supporting evidence ({error}).</p>
        </div>
      </div>
    );
  }

  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-700 rounded-lg">
        <p className="text-sm text-slate-500">No supporting evidence available for this event.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {evidence.map((ev) => (
        <div key={ev.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col h-full hover:border-slate-600 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                {ev.source_type}
              </div>
              <h4 className="text-sm font-medium text-slate-200 line-clamp-1" title={ev.source_name}>
                {ev.source_name}
              </h4>
            </div>
            {ev.source_reference && (
              <a href={ev.source_reference} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors" title="View Source">
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          <div className="flex-1 bg-slate-950 rounded p-3 mb-4 text-xs text-slate-400 overflow-y-auto max-h-32 leading-relaxed">
            {ev.content}
          </div>

          <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 mt-auto">
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">Confidence</div>
              <div className="text-xs font-semibold text-slate-200">
                {ev.confidence !== null && ev.confidence !== undefined 
                  ? `${(ev.confidence * 100).toFixed(0)}%` 
                  : <span className="text-slate-500 font-normal italic">Confidence unavailable</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-500 mb-0.5">Published</div>
              <div className="text-xs text-slate-300">
                {ev.published_at ? format(new Date(ev.published_at), 'MMM d, yyyy') : <span className="italic text-slate-500">Not available</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
