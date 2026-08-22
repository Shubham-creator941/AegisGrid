import EmptyState from '../components/ui/EmptyState';
import { ShieldAlert } from 'lucide-react';

export default function Audit() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-200">System Audit Log</h1>
        <p className="text-sm text-slate-500 mt-1">Immutable record of system changes and user actions.</p>
      </div>
      <EmptyState 
        title="Audit Logs Restricted"
        description="Audit visibility is restricted. Connecting to log streams..."
        icon={<ShieldAlert size={32} />}
      />
    </div>
  );
}
