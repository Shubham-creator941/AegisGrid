import { Ship } from 'lucide-react';

export function ArrivalsTable() {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Ship size={16} className="text-blue-400" />
          Scheduled Arrivals
        </h3>
      </div>
      <div className="p-8 flex flex-col items-center justify-center text-center bg-slate-800/10">
        <Ship size={32} className="text-slate-600 mb-3" />
        <h4 className="text-slate-300 font-medium mb-1">Arrival telemetry unavailable</h4>
        <p className="text-sm text-slate-500 max-w-sm">
          The current network data stream does not provide scheduled vessel arrival telemetry or estimated times of arrival (ETA).
        </p>
      </div>
    </div>
  );
}
