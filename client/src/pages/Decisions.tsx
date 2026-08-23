import EmptyState from '../components/ui/EmptyState';
import { FileCheck, CheckCircle, Clock } from 'lucide-react';
import { USE_DEMO_DATA } from '../config/demo.config';
import { mockDecisions } from '../mocks/demoData';

export default function Decisions() {
  const decisionsList = Object.values(mockDecisions);

  return (
    <div className="h-full max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FileCheck className="text-purple-500" />
            Decision Register
          </h1>
          <p className="text-sm text-slate-400 mt-1">Finalized human-in-the-loop operational decisions.</p>
        </div>
      </div>

      {USE_DEMO_DATA && decisionsList.length > 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Decision ID</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Response ID</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rationale</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {decisionsList.map((decision: any) => (
                <tr key={decision.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-300 font-mono">{decision.id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold tracking-wider bg-green-900/40 text-green-400 border border-green-900/50">
                      <CheckCircle size={12} /> {decision.decision_type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-300 font-mono">{decision.selected_response_id}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-slate-400 italic">"{decision.reason}"</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-500" />
                      <span className="text-sm text-slate-400">{new Date(decision.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState 
          title="Decision Register"
          description="Historical and pending operational decisions will appear here."
          icon={<FileCheck size={32} />}
        />
      )}
    </div>
  );
}
