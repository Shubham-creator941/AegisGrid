import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function DecisionWorkspace() {
  const { scenarioId } = useParams();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scenarioId) return;
    
    // Auto-evaluate the scenario on load (in a real app, this might be a button click or fetch existing evaluation)
    fetch(`http://localhost:3000/api/v1/scenarios/${scenarioId}/evaluate`, {
      method: 'POST'
    })
      .then(res => {
        if (!res.ok) throw new Error('Evaluation failed. Check backend logs.');
        return res.json();
      })
      .then(data => {
        setEvaluation(data.data.result);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [scenarioId]);

  if (loading) return <div className="p-8 text-white">Running Evaluation Engine...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!evaluation) return <div className="p-8 text-white">No evaluation available.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto text-gray-100 font-sans space-y-8 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Decision Workspace (Phase 6)</h1>

      {/* Impact Assessment */}
      <section className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">Projected Impact</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-4 rounded text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wide">Supply</div>
            <div className="text-2xl font-bold">{evaluation.impact?.supply_impact.toFixed(1) ?? 'N/A'}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wide">Economic</div>
            <div className="text-2xl font-bold">{evaluation.impact?.economic_impact.toFixed(1) ?? 'N/A'}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wide">Operational</div>
            <div className="text-2xl font-bold">{evaluation.impact?.operational_impact.toFixed(1) ?? 'N/A'}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded text-center">
            <div className="text-sm text-gray-400 uppercase tracking-wide">Overall</div>
            <div className="text-2xl font-bold">{evaluation.impact?.overall_impact.toFixed(1) ?? 'N/A'}</div>
          </div>
        </div>
      </section>

      {/* Candidate Comparison */}
      <section className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">Response Alternatives</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3 text-gray-400 font-medium">Candidate</th>
                <th className="p-3 text-gray-400 font-medium">Feasible?</th>
                <th className="p-3 text-gray-400 font-medium">Violations</th>
                <th className="p-3 text-gray-400 font-medium">Score</th>
                <th className="p-3 text-gray-400 font-medium">Rank</th>
              </tr>
            </thead>
            <tbody>
              {evaluation.responses.map((candidate: any) => {
                const constraint = evaluation.constraints.find((c: any) => c.response_candidate_id === candidate.id);
                const score = evaluation.scores.find((s: any) => s.response_candidate_id === candidate.id);
                const ranked = evaluation.ranking?.find((r: any) => r.candidate.id === candidate.id);
                
                return (
                  <tr key={candidate.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="p-3 font-semibold text-gray-200">
                      <div>{candidate.name}</div>
                      <div className="text-sm text-gray-500 font-normal">{candidate.response_type}</div>
                    </td>
                    <td className="p-3">
                      {constraint?.feasible ? (
                        <span className="text-green-400 font-bold">YES</span>
                      ) : (
                        <span className="text-red-400 font-bold">NO</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-400">
                      {constraint?.violations?.length ? constraint.violations.join(', ') : 'None'}
                    </td>
                    <td className="p-3 text-yellow-400 font-mono">
                      {score?.overall_score?.toFixed(1) ?? 'N/A'}
                    </td>
                    <td className="p-3 font-bold text-lg">
                      {ranked?.rank ? `#${ranked.rank}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recommendation */}
      {evaluation.recommendation && (
        <section className="bg-gray-800 p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h2 className="text-xl font-semibold mb-4 text-green-400">System Recommendation</h2>
          <div className="mb-4">
            <span className="text-gray-400 text-sm">Recommended Action:</span>
            <div className="text-2xl font-bold mt-1">
              {evaluation.responses.find((r: any) => r.id === evaluation.recommendation.response_candidate_id)?.name}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Rationale</h3>
              <p className="text-gray-300 bg-gray-700 p-3 rounded text-sm leading-relaxed">
                {evaluation.recommendation.rationale}
              </p>
            </div>
            
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Key Trade-offs</h3>
              <ul className="text-gray-300 bg-gray-700 p-3 rounded text-sm list-disc pl-5 space-y-1">
                {evaluation.recommendation.tradeoffs?.map((t: string, i: number) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-4 flex gap-4 text-sm">
            <div className="bg-gray-700 px-3 py-1 rounded">
              <span className="text-gray-400 mr-2">Confidence:</span>
              <span className="text-blue-400 font-bold">{(evaluation.recommendation.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
