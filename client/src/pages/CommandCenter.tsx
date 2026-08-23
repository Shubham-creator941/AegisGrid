import { AlertCircle } from 'lucide-react';
import { useNetworkOverview } from '../features/network/hooks/useNetwork';
import { KpiCards } from '../features/network/components/KpiCards';
import { NetworkTopology } from '../features/network/components/NetworkTopology';
import { GeographicMap } from '../features/network/components/GeographicMap';

import { AnalyticsPanels } from '../features/network/components/AnalyticsPanels';
import { USE_DEMO_DATA } from '../config/demo.config';

export default function CommandCenter() {
  const { data, loading, error } = useNetworkOverview();

  // For the demo scenario, we want to pre-highlight the "recommended route" from the Recommendations context
  // The route is the Petroline / Saudi East-West bypass.
  // The related nodes are the origin, the pipeline corridor, and the Red Sea.
  // We'll simulate this so the map accurately reflects the "Command Center" view of the active situation.
  const demoHighlightedNodeIds = USE_DEMO_DATA ? ['origin-sa-1', 'chokepoint-3', 'fac-3'] : undefined; // These IDs correspond to Ras Tanura, Petroline, Red Sea Destination if they exist in the mock dataset.
  
  return (
    <div className="h-full flex flex-col max-w-[1600px] mx-auto w-full text-slate-200">
      
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">Network Overview</h1>
        <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-1">Real-time operational pulse of the global energy supply network.</p>
      </div>

      {error ? (
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3 flex items-center gap-3 text-red-400 mb-4 shadow-sm">
          <AlertCircle size={16} />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider">Network Intelligence Unreachable</h3>
            <p className="text-xs mt-0.5 opacity-80">Failed to connect to backend telemetry ({error}).</p>
          </div>
        </div>
      ) : null}

      {/* KPI Cards Row */}
      <KpiCards loading={loading} />

      {/* Main Content Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 flex-1 min-h-[450px]">
        
        {/* Left: Network Topology */}
        <div className="lg:col-span-3 h-full overflow-hidden">
          <NetworkTopology 
            suppliers={data?.suppliers || []} 
            facilities={data?.facilities || []} 
            corridors={data?.corridors || []} 
            supplyFlows={data?.supplyFlows || []} 
            loading={loading}
          />
        </div>

        {/* Center: Geographic Map */}
        <div className="lg:col-span-9 h-full bg-[#0B1120] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm flex flex-col relative">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-[#0F172A]/80 backdrop-blur border border-[#1E293B] px-3 py-1.5 rounded shadow-sm">
              Global Supply Network
            </span>
          </div>
          <div className="flex-1 w-full h-full">
            <GeographicMap 
              facilities={data?.facilities || []}
              supplyFlows={data?.supplyFlows || []}
              highlightedNodeIds={demoHighlightedNodeIds}
              isSelectedRecommended={true} // Force true to show the glowing cyan route in Command Center to match the story
              selectedCandidateName="Reroute via Petroliner" 
            />
          </div>
        </div>

      </div>

      {/* Bottom Analytics Row */}
      <div className="mt-auto">
        <AnalyticsPanels />
      </div>

    </div>
  );
}
