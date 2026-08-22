import EmptyState from '../components/ui/EmptyState';
import { Activity } from 'lucide-react';

export default function Events() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-200">Disruption Events</h1>
        <p className="text-sm text-slate-500 mt-1">Monitor geopolitical and operational disruption events.</p>
      </div>
      <EmptyState 
        title="Event Monitoring Offline"
        description="Event and evidence collection pipeline is currently pending connection."
        icon={<Activity size={32} />}
      />
    </div>
  );
}
