import EmptyState from '../components/ui/EmptyState';
import { Network as NetworkIcon } from 'lucide-react';

export default function Network() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-200">Network Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Energy supply chain topology and asset management.</p>
      </div>
      <EmptyState 
        title="Network Module Offline"
        description="Topology and asset synchronization modules are pending deployment."
        icon={<NetworkIcon size={32} />}
      />
    </div>
  );
}
