import EmptyState from '../components/ui/EmptyState';
import { GitPullRequest } from 'lucide-react';

export default function Scenarios() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-200">Scenarios</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and configure assumptions for scenario evaluations.</p>
      </div>
      <EmptyState 
        title="Scenario Engineering"
        description="The scenario modeling configuration interface is pending."
        icon={<GitPullRequest size={32} />}
      />
    </div>
  );
}
