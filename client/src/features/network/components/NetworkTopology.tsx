import { Activity, Anchor, Box, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Supplier, Facility, Corridor, SupplyFlow } from '../api/network.api';

interface NetworkTopologyProps {
  suppliers: Supplier[];
  facilities: Facility[];
  corridors: Corridor[];
  supplyFlows: SupplyFlow[];
  loading?: boolean;
  highlightedNodeIds?: string[];
}

export function NetworkTopology({ suppliers, facilities, corridors, supplyFlows, loading, highlightedNodeIds }: NetworkTopologyProps) {
  const sfCount = supplyFlows ? supplyFlows.length : 0;
  
  const hasHighlights = highlightedNodeIds && highlightedNodeIds.length > 0;
  const isHighlighted = (id: string) => hasHighlights && highlightedNodeIds!.includes(id);
  const getContainerClass = (id: string, baseClass: string, highlightClass: string) => {
    if (!hasHighlights) return baseClass;
    if (isHighlighted(id)) return highlightClass;
    return `${baseClass} opacity-30 grayscale saturate-50`;
  };
  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center border border-slate-700 bg-slate-800/30 rounded-lg">
        <div className="flex flex-col items-center text-slate-500">
          <Activity className="animate-spin mb-2" size={24} />
          <span className="text-sm">Mapping Network Topology...</span>
        </div>
      </div>
    );
  }

  if (!suppliers.length && !facilities.length) {
    return (
      <div className="w-full h-80 flex items-center justify-center border border-slate-700 bg-slate-800/30 rounded-lg">
        <div className="flex flex-col items-center text-slate-500">
          <Anchor className="mb-2 opacity-50" size={24} />
          <span className="text-sm">No topological data available</span>
        </div>
      </div>
    );
  }

  const origins = facilities.filter(f => f.facility_type === 'EXPORT_TERMINAL' || f.facility_type === 'PRODUCTION_SITE');
  const destinations = facilities.filter(f => f.facility_type === 'COMMERCIAL_REFINERY' || f.facility_type === 'STRATEGIC_RESERVE');

  const renderStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle size={12} className="text-emerald-400" />;
      case 'MAINTENANCE':
      case 'DISRUPTED': return <AlertTriangle size={12} className="text-amber-400" />;
      case 'INACTIVE': return <XCircle size={12} className="text-slate-500" />;
      default: return <div className="w-3 h-3 rounded-full bg-slate-600" />;
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto p-6">
      <div className="min-w-[800px] flex justify-between items-stretch gap-4 h-full relative">
        
        {/* Suppliers Column */}
        <div className="flex flex-col gap-4 flex-1">
          <h3 className="text-xs font-semibold text-slate-500 tracking-wider mb-2">SUPPLIERS</h3>
          {suppliers.map(s => (
            <div key={s.id} className={`p-3 rounded shadow-sm transition-all duration-300 ${getContainerClass(s.id, 'bg-slate-800 border border-slate-700 hover:border-slate-500', 'bg-blue-900/30 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]')}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium text-sm truncate ${isHighlighted(s.id) ? 'text-white' : 'text-slate-200'}`}>{s.name}</span>
                {renderStatus(s.status)}
              </div>
              <div className="text-xs flex items-center gap-2 text-slate-400">
                <Box size={10} />
                {s.supplier_type} &middot; {s.country}
              </div>
            </div>
          ))}
        </div>

        {/* Origin Facilities Column */}
        <div className="flex flex-col gap-4 flex-1">
          <h3 className="text-xs font-semibold text-slate-500 tracking-wider mb-2">ORIGIN TERMINALS</h3>
          {origins.map(f => (
            <div key={f.id} className={`p-3 rounded shadow-sm transition-all duration-300 ${getContainerClass(f.id, 'bg-slate-800 border border-slate-700 hover:border-slate-500', 'bg-blue-900/30 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]')}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium text-sm truncate ${isHighlighted(f.id) ? 'text-white' : 'text-slate-200'}`}>{f.name}</span>
                {renderStatus(f.status)}
              </div>
              <div className="text-xs text-slate-400">
                {f.region}
              </div>
            </div>
          ))}
        </div>

        {/* Corridors / Flows Column */}
        <div className="flex flex-col gap-4 flex-1 justify-center relative">
          <h3 className="text-xs font-semibold text-slate-500 tracking-wider mb-2 absolute top-0 w-full text-center">MARITIME CORRIDORS</h3>
          <div className="flex flex-col gap-4 pt-8">
            {corridors.map(c => (
              <div key={c.id} className={`p-3 rounded shadow-sm transition-all duration-300 ${getContainerClass(c.id, 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-500', 'bg-blue-900/30 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]')}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium text-sm truncate ${isHighlighted(c.id) ? 'text-white' : 'text-slate-300'}`}>{c.name}</span>
                  {renderStatus(c.status)}
                </div>
                <div className="text-xs text-slate-400 flex justify-between">
                  <span>{c.origin} &rarr; {c.destination}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Destination Facilities Column */}
        <div className="flex flex-col gap-4 flex-1">
          <h3 className="text-xs font-semibold text-slate-500 tracking-wider mb-2" title={`Active Flows: ${sfCount}`}>DESTINATION (MUMBAI)</h3>
          {destinations.map(f => (
            <div key={f.id} className={`p-3 rounded shadow-sm transition-all duration-300 ${getContainerClass(f.id, 'bg-slate-800 border border-blue-900/50 hover:border-blue-700', 'bg-blue-900/30 border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]')}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium text-sm truncate ${isHighlighted(f.id) ? 'text-white' : 'text-blue-100'}`}>{f.name}</span>
                {renderStatus(f.status)}
              </div>
              <div className="text-xs text-blue-300/70">
                {f.region}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
