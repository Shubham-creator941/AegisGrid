import EmptyState from '../components/ui/EmptyState';
import { FileCheck } from 'lucide-react';

export default function Decisions() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-200">Decisions</h1>
        <p className="text-sm text-slate-500 mt-1">Finalized human-in-the-loop operational decisions.</p>
      </div>
      <EmptyState 
        title="Decision Register"
        description="Historical and pending operational decisions will appear here."
        icon={<FileCheck size={32} />}
      />
    </div>
  );
}
