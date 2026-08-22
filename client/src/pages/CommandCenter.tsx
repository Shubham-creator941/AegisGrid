import EmptyState from '../components/ui/EmptyState';
import { LayoutDashboard } from 'lucide-react';

export default function CommandCenter() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-200">Command Center</h1>
        <p className="text-sm text-slate-500 mt-1">Operational overview of network resilience.</p>
      </div>
      <EmptyState 
        title="Command Center Initializing"
        description="The operational command center module is pending future deployment. System structural integrity maintained."
        icon={<LayoutDashboard size={32} />}
      />
    </div>
  );
}
