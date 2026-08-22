import EmptyState from '../components/ui/EmptyState';
import { BarChart3 } from 'lucide-react';

export default function Evaluations() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-200">Evaluations</h1>
        <p className="text-sm text-slate-500 mt-1">Review running and historical scenario simulation evaluations.</p>
      </div>
      <EmptyState 
        title="Evaluation Reports"
        description="The evaluation metrics and simulation report interface is pending."
        icon={<BarChart3 size={32} />}
      />
    </div>
  );
}
