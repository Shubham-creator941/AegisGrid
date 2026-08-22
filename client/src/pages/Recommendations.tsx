import EmptyState from '../components/ui/EmptyState';
import { CheckCircle } from 'lucide-react';

export default function Recommendations() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-200">Recommendations</h1>
        <p className="text-sm text-slate-500 mt-1">AI-synthesized response alternatives and rankings.</p>
      </div>
      <EmptyState 
        title="Recommendations Module"
        description="Ranked candidate generation is pending connection."
        icon={<CheckCircle size={32} />}
      />
    </div>
  );
}
