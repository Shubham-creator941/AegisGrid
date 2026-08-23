import { USE_DEMO_DATA } from '../../../config/demo.config';

export function KpiCards({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-5 animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (USE_DEMO_DATA) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
          <span className="text-xs font-semibold tracking-wider text-slate-500 mb-1 uppercase">Total Volume in Transit</span>
          <span className="text-2xl font-semibold text-slate-100">1.8M bbl/d</span>
          <span className="text-xs text-slate-400 mt-2">Active supply flows</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
          <span className="text-xs font-semibold tracking-wider text-slate-500 mb-1 uppercase">Strategic Reserve Cover</span>
          <span className="text-2xl font-semibold text-slate-100">45 Days</span>
          <span className="text-xs text-slate-400 mt-2">At current consumption rates</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
          <span className="text-xs font-semibold tracking-wider text-slate-500 mb-1 uppercase">Active Disruption Alerts</span>
          <span className="text-2xl font-semibold text-red-500">1 Critical</span>
          <span className="text-xs text-slate-400 mt-2">Strait of Hormuz Blockade</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
        <span className="text-xs font-semibold tracking-wider text-slate-500 mb-1 uppercase">Total Volume in Transit</span>
        <span className="text-2xl font-light text-slate-400 italic">No network data</span>
        <span className="text-xs text-slate-600 mt-2">Telemetry disconnected</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
        <span className="text-xs font-semibold tracking-wider text-slate-500 mb-1 uppercase">Strategic Reserve Cover</span>
        <span className="text-2xl font-light text-slate-400 italic">Not available</span>
        <span className="text-xs text-slate-600 mt-2">Requires consumption rate feed</span>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col">
        <span className="text-xs font-semibold tracking-wider text-slate-500 mb-1 uppercase">Active Disruption Alerts</span>
        <span className="text-2xl font-light text-slate-400 italic">Not available</span>
        <span className="text-xs text-slate-600 mt-2">Event intelligence stream offline</span>
      </div>
    </div>
  );
}
