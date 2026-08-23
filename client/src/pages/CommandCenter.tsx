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
    <div className="h-full flex flex-col max-w-[1600px] mx-auto w-full text-slate-200 overflow-y-auto p-6">
      
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Network Overview</h1>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Real-time operational pulse of the global energy supply network.</p>
      </div>

      {error ? (
        <div className="bg-[#FF414D]/10 border border-[#FF414D]/30 rounded-xl p-4 flex items-center gap-3 text-[#FF414D] mb-6 shadow-sm">
          <AlertCircle size={18} />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest">Network Intelligence Unreachable</h3>
            <p className="text-xs mt-0.5 opacity-80 font-medium">Failed to connect to backend telemetry ({error}).</p>
          </div>
        </div>
      ) : null}

      {/* KPI Cards Row */}
      <KpiCards loading={loading} />

      {/* Main Content Grid (2 Columns) */}
      <div className="grid grid-cols-1 xl:grid-cols-[28%_1fr] gap-4 lg:gap-6 mb-6 flex-1 min-h-[450px]">
        
        {/* Left: Network Topology */}
        <div className="h-[400px] xl:h-full overflow-hidden bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] shadow-sm flex flex-col">
          <NetworkTopology 
            suppliers={data?.suppliers || []} 
            facilities={data?.facilities || []} 
            corridors={data?.corridors || []} 
            supplyFlows={data?.supplyFlows || []} 
            loading={loading}
          />
        </div>

        {/* Center: Geographic Map */}
        <div className="h-[500px] xl:h-full bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] overflow-hidden shadow-sm flex flex-col relative focus-within:ring-2 focus-within:ring-aegis-blue focus-within:border-aegis-blue transition-colors">
          <div className="absolute top-5 left-5 z-10 flex gap-2">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-[#0B1120]/90 backdrop-blur-md border border-[#1E293B] px-3 py-1.5 rounded-[var(--radius-sm)] shadow-sm">
              Global Supply Network
            </span>
          </div>
          <div className="flex-1 w-full h-full relative z-0">
            <GeographicMap 
              facilities={data?.facilities || []}
              supplyFlows={data?.supplyFlows || []}
              highlightedNodeIds={demoHighlightedNodeIds}
              isSelectedRecommended={true} // Force true to show the glowing cyan route in Command Center to match the story
              selectedCandidateName="Reroute via Petroline" 
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
