import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEvaluation } from '../hooks/useEvaluations';
import { useScenario } from '../../scenarios/hooks/useScenarios';
import { BarChart3, AlertCircle, RefreshCw, CheckCircle2, XCircle, Clock, Database, ChevronRight, Activity, ArrowRight, TrendingDown, Info } from 'lucide-react';

export default function EvaluationWorkspace() {
  const [searchParams] = useSearchParams();
  const evaluationId = searchParams.get('evaluationId');
  const navigate = useNavigate();
  
  const { evaluation, evaluationResult, loading, error, fetchEvaluationStatus, fetchEvaluationResult } = useEvaluation();
  const { scenario, fetchScenario } = useScenario();

  const [expandedSection, setExpandedSection] = useState<string | null>('impact');

  useEffect(() => {
    if (evaluationId) {
      fetchEvaluationStatus(evaluationId).then((evalData) => {
        if (evalData && evalData.status === 'COMPLETED') {
          fetchEvaluationResult(evaluationId);
        }
        if (evalData && evalData.scenario_id) {
          fetchScenario(evalData.scenario_id);
        }
      }).catch(console.error);
    }
  }, [evaluationId, fetchEvaluationStatus, fetchEvaluationResult, fetchScenario]);

  if (!evaluationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <BarChart3 size={48} className="mb-4 opacity-50" />
        <h2 className="text-xl font-medium text-slate-200">No Evaluation Selected</h2>
        <p className="mt-2 text-center max-w-md">
          Please select an evaluation from a Scenario Workspace to view simulation and impact results.
        </p>
        <button 
          onClick={() => navigate('/app/scenarios')}
          className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
        >
          Go to Scenarios
        </button>
      </div>
    );
  }

  const handleRefresh = () => {
    fetchEvaluationStatus(evaluationId).then((evalData) => {
      if (evalData && evalData.status === 'COMPLETED') {
        fetchEvaluationResult(evaluationId);
      }
    });
  };

  const isRunning = evaluation?.status === 'PENDING' || evaluation?.status === 'RUNNING';
  const isFailed = evaluation?.status === 'FAILED';
  const isCompleted = evaluation?.status === 'COMPLETED';

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pb-8">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <BarChart3 className="text-blue-500" size={24} />
            Evaluation Workspace
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
            <span className="font-mono">ID: {evaluationId}</span>
            {scenario && (
              <>
                <span>&bull;</span>
                <span>Scenario: <span className="text-slate-300 font-medium">{scenario.name}</span></span>
              </>
            )}
            {evaluation?.engine_version && (
              <>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Database size={12} />
                  Engine: {evaluation.engine_version}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
            title="Refresh Status"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          {evaluation?.status === 'COMPLETED' && (
            <span className="bg-green-900/50 text-green-400 border border-green-900/50 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs">
              <CheckCircle2 size={14} /> COMPLETED
            </span>
          )}
          {isRunning && (
            <span className="bg-orange-900/50 text-orange-400 border border-orange-900/50 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs">
              <Activity size={14} className="animate-pulse" /> {evaluation.status}
            </span>
          )}
          {isFailed && (
            <span className="bg-red-900/50 text-red-400 border border-red-900/50 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs">
              <XCircle size={14} /> FAILED
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 rounded p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={18} />
          <div>
            <h3 className="text-sm font-medium text-red-500">Evaluation Error</h3>
            <p className="text-sm text-red-400/80 mt-1">{error.message}</p>
          </div>
        </div>
      )}

      {/* STATUS LIFECYCLE STRIP */}
      {evaluation && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isRunning ? 'bg-blue-900/50 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
              <Activity size={16} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Simulation Started</p>
              <p className="text-sm text-slate-200 font-mono mt-0.5">
                {evaluation.started_at ? new Date(evaluation.started_at).toLocaleTimeString() : 'Pending...'}
              </p>
            </div>
          </div>
          
          <div className="hidden md:block flex-1 h-px bg-slate-800 relative">
            <div className={`absolute left-0 top-0 h-full transition-all duration-1000 ${isCompleted || isFailed ? 'w-full' : 'w-1/2'} ${isFailed ? 'bg-red-500/50' : 'bg-blue-500/50'}`} />
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-900/50 text-green-400' : isFailed ? 'bg-red-900/50 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
              {isCompleted ? <CheckCircle2 size={16} /> : isFailed ? <XCircle size={16} /> : <Clock size={16} />}
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Result Generated</p>
              <p className="text-sm text-slate-200 font-mono mt-0.5">
                {evaluation.completed_at ? new Date(evaluation.completed_at).toLocaleTimeString() : 'Awaiting Engine...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT AREA */}
      {isRunning && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-lg bg-slate-900/20">
          <Activity className="text-blue-500 mb-4 animate-pulse" size={48} />
          <h3 className="text-lg font-medium text-slate-300">Engine Running</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md text-center">
            The deterministic evaluation engine is currently processing network constraints, simulating supply impacts, and ranking candidate responses.
          </p>
        </div>
      )}

      {isFailed && (
        <div className="flex-1 flex flex-col items-center justify-center py-20 border-2 border-dashed border-red-900/30 rounded-lg bg-red-900/5">
          <XCircle className="text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-medium text-red-400">Evaluation Failed</h3>
          <p className="text-sm text-red-400/70 mt-2 max-w-md text-center">
            The engine encountered an error during evaluation. No recommendation was generated.
          </p>
        </div>
      )}

      {isCompleted && evaluationResult && (
        <div className="space-y-6">
          {/* CASCADING IMPACT VISUALIZATION */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider mb-6 flex items-center gap-2">
              <TrendingDown size={16} className="text-orange-500" />
              Causal Chain Impact Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
              
              <div className="relative z-10 bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-lg">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Trigger</p>
                <p className="text-sm text-slate-200 font-medium">Disruption Scenario</p>
                <p className="text-xs text-slate-400 mt-2">{scenario?.name || 'Unknown'}</p>
              </div>
              
              <div className="relative z-10 bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-lg">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Direct Impact</p>
                <p className="text-sm text-slate-200 font-medium">Supply Constraint</p>
                <p className="text-xs text-slate-400 font-mono mt-2 text-orange-400">
                  {evaluationResult.impact ? `${(evaluationResult.impact.supply_impact * 100).toFixed(1)}% drop` : 'Data Unavailable'}
                </p>
              </div>
              
              <div className="relative z-10 bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-lg">
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Buffer Depletion</p>
                <p className="text-sm text-slate-200 font-medium">Reserve Impact</p>
                <p className="text-xs text-slate-400 font-mono mt-2 text-orange-400">
                  {evaluationResult.impact ? `${(evaluationResult.impact.reserve_impact * 100).toFixed(1)}% depleted` : 'Data Unavailable'}
                </p>
              </div>
              
              <div className="relative z-10 bg-slate-900 border border-orange-900/50 rounded-lg p-4 shadow-lg ring-1 ring-orange-500/20">
                <p className="text-xs text-orange-500/70 font-medium uppercase mb-1">Systemic</p>
                <p className="text-sm text-orange-200 font-medium">Overall Severity</p>
                <p className="text-lg text-orange-400 font-mono mt-1">
                  {evaluationResult.impact ? `${(evaluationResult.impact.overall_impact * 100).toFixed(0)} / 100` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* PROGRESSIVE DISCLOSURE SECTIONS */}
          <div className="space-y-4">
            {/* Impact Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden p-0">
              <button 
                className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors"
                onClick={() => setExpandedSection(expandedSection === 'impact' ? null : 'impact')}
              >
                <span className="font-medium text-slate-200 flex items-center gap-2">
                  <Activity size={18} className="text-slate-400" />
                  Impact Calculation Details
                </span>
                <ChevronRight size={18} className={`text-slate-500 transition-transform ${expandedSection === 'impact' ? 'rotate-90' : ''}`} />
              </button>
              
              {expandedSection === 'impact' && (
                <div className="p-4 border-t border-slate-700/50">
                  {evaluationResult.impact ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                        <p className="text-xs text-slate-500 mb-1">Supply Impact</p>
                        <p className="text-sm text-slate-200 font-mono">{(evaluationResult.impact.supply_impact * 100).toFixed(2)}%</p>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                        <p className="text-xs text-slate-500 mb-1">Economic Impact</p>
                        <p className="text-sm text-slate-200 font-mono">{(evaluationResult.impact.economic_impact * 100).toFixed(2)}%</p>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                        <p className="text-xs text-slate-500 mb-1">Operational Impact</p>
                        <p className="text-sm text-slate-200 font-mono">{(evaluationResult.impact.operational_impact * 100).toFixed(2)}%</p>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded border border-slate-800">
                        <p className="text-xs text-slate-500 mb-1">Resilience Impact</p>
                        <p className="text-sm text-slate-200 font-mono">{(evaluationResult.impact.resilience_impact * 100).toFixed(2)}%</p>
                      </div>
                      <div className="col-span-full text-xs text-slate-500 flex items-center gap-2 mt-2">
                        <Info size={14} />
                        Engine Calculation Version: <span className="font-mono">{evaluationResult.impact.calculation_version}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Impact metrics not available from current evaluation.</p>
                  )}
                </div>
              )}
            </div>

            {/* Simulation Details */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden p-0">
              <button 
                className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors"
                onClick={() => setExpandedSection(expandedSection === 'sim' ? null : 'sim')}
              >
                <span className="font-medium text-slate-200 flex items-center gap-2">
                  <Database size={18} className="text-slate-400" />
                  Simulation Telemetry
                </span>
                <ChevronRight size={18} className={`text-slate-500 transition-transform ${expandedSection === 'sim' ? 'rotate-90' : ''}`} />
              </button>
              
              {expandedSection === 'sim' && (
                <div className="p-4 border-t border-slate-700/50">
                  {evaluationResult.simulation ? (
                    <div className="text-sm text-slate-300">
                      <pre className="font-mono text-xs bg-slate-900 p-4 rounded overflow-auto text-slate-400">
                        {JSON.stringify(evaluationResult.simulation, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 bg-slate-900/30 p-4 rounded border border-slate-800">
                      <Info className="text-slate-400 shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="text-sm text-slate-300 font-medium">Not Available</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Simulation outputs (like exact shortfall barrels or reserve levels) are calculated by the engine but not persisted in the current API version for this MVP.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Candidate Responses summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden p-0">
              <div className="w-full flex items-center justify-between p-4 bg-slate-800/50 border-b border-slate-700/50">
                <span className="font-medium text-slate-200 flex items-center gap-2">
                  <ArrowRight size={18} className="text-slate-400" />
                  Generated Candidate Responses
                </span>
                <span className="bg-slate-800 text-slate-300 border border-slate-700 rounded-full px-2 py-0.5 text-xs">{evaluationResult.responses?.length || 0} Generated</span>
              </div>
              
              <div className="p-4">
                {evaluationResult.responses && evaluationResult.responses.length > 0 ? (
                  <div className="space-y-3">
                    {evaluationResult.responses.map(resp => (
                      <div key={resp.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded">
                        <div>
                          <p className="text-sm text-slate-200 font-medium">{resp.action_type}</p>
                          <p className="text-xs text-slate-500 mt-1">ID: {resp.id}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${resp.status === 'FEASIBLE' ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-orange-900/30 text-orange-400 border-orange-900/50'}`}>{resp.status}</span>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                      <button 
                        onClick={() => navigate(`/app/recommendations?evaluationId=${evaluationId}`)}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                      >
                        Compare Recommendations <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No candidate responses were generated.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
