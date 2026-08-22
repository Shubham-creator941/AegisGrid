import { AlertCircle } from 'lucide-react';
import { useNetworkOverview } from '../features/network/hooks/useNetwork';
import { KpiCards } from '../features/network/components/KpiCards';
import { NetworkTopology } from '../features/network/components/NetworkTopology';
import { ArrivalsTable } from '../features/network/components/ArrivalsTable';

export default function CommandCenter() {
  const { data, loading, error } = useNetworkOverview();

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-200">Network Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Operational pulse of the energy supply network.</p>
      </div>

      {error ? (
        <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-4 flex items-center gap-3 text-red-400 mb-6">
          <AlertCircle size={20} />
          <div>
            <h3 className="text-sm font-semibold">Network Intelligence Unreachable</h3>
            <p className="text-xs mt-1">Failed to connect to backend telemetry ({error}).</p>
          </div>
        </div>
      ) : null}

      <KpiCards loading={loading} />

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Network Topology</h2>
        <NetworkTopology 
          suppliers={data?.suppliers || []} 
          facilities={data?.facilities || []} 
          corridors={data?.corridors || []} 
          supplyFlows={data?.supplyFlows || []} 
          loading={loading}
        />
      </div>

      <div className="mb-6">
        <ArrivalsTable />
      </div>
    </div>
  );
}
