import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useScenario } from '../hooks/useScenarios';
import { Play, AlertCircle, Info, Activity, FileText } from 'lucide-react';
import { useEventsList } from '../../events/hooks/useEvents';

export default function ScenarioWorkspace() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const navigate = useNavigate();
  const user = { id: 'USR-1' };
  
  const { data: events } = useEventsList();
  const { createScenario, evaluateScenario, loading, error } = useScenario();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');



  const activeEvent = (events || []).find((e: any) => e.id === eventId);

  useEffect(() => {
    if (activeEvent) {
      setName(`Scenario for: ${activeEvent.title}`);
      setDescription(`Evaluating response strategies for event ${activeEvent.id} concerning ${activeEvent.affected_region}`);
    }
  }, [activeEvent]);

  const handleEvaluate = async () => {
    if (!name || !description || !eventId || !user) return;
    
    try {
      // Create scenario (since assumptions are not updatable via API, name/desc are the constraints)
      const scenario = await createScenario({
        name,
        description,
        event_id: eventId,
        created_by: user.id
      });
      
      // Evaluate scenario
      const idempotencyKey = `eval_${scenario.id}_${Date.now()}`;
      const evalResult = await evaluateScenario(scenario.id, idempotencyKey);
      
      // Navigate to evaluation workspace
      const evalId = evalResult?.evaluation?.id || evalResult?.id;
      if (evalId) {
        navigate(`/app/evaluations?evaluationId=${evalId}`);
      }
    } catch (err) {
      console.error('Evaluation failed:', err);
    }
  };

  if (!eventId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <AlertCircle size={48} className="mb-4 opacity-50" />
        <h2 className="text-xl font-medium text-slate-200">No Event Selected</h2>
        <p className="mt-2 text-center max-w-md">
          A scenario must be linked to a specific disruption event. Please select an event from the Network Overview to begin scenario engineering.
        </p>
        <button 
          onClick={() => navigate('/app/events')}
          className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
        >
          View Events
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-200 flex items-center gap-2">
            <Activity className="text-blue-500" size={24} />
            Scenario Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Define disruption parameters and assumptions before running the simulation engine.
          </p>
        </div>
        <span className="bg-orange-900/50 text-orange-400 border border-orange-900/50 rounded-full px-3 py-1 text-xs font-medium">DRAFT</span>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-900/50 rounded p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 mt-0.5" size={18} />
          <div>
            <h3 className="text-sm font-medium text-red-500">Scenario Configuration Failed</h3>
            <p className="text-sm text-red-400/80 mt-1">{error.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Parameter Input */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2 text-slate-200 font-medium">
              <FileText size={18} /> Scenario Parameters
            </div>
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Scenario Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                  placeholder="e.g., 30-Day Total Blockade"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Operational Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 resize-none"
                  placeholder="Describe the nature of the disruption and expected operational impact..."
                />
              </div>
              
              <div className="bg-slate-900/50 border border-slate-800 rounded p-3 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={14} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-300">Backend Contract Note</span>
                </div>
                <p className="text-xs text-slate-500">
                  Detailed assumption variables (duration, drop percentage, constraints) are managed internally by the engine during this phase. Only core scenario metadata is configurable here.
                </p>
              </div>
            </div>
          </div>

          {activeEvent && (
            <div className="bg-slate-800/30 border border-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2 text-slate-200 font-medium">Event Context</div>
              <div className="space-y-3 pt-2 text-sm">
                <div className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Event ID</span>
                  <span className="text-slate-200 font-mono text-xs">{activeEvent.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Status</span>
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 rounded-full px-2 py-0.5 text-xs">{activeEvent.status}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-400">Region</span>
                  <span className="text-slate-200">{activeEvent.affected_region}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Impact Preview */}
        <div className="xl:col-span-2 flex flex-col">
          <div className="flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2 text-slate-200 font-medium">Projected Impact Preview</div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-lg bg-slate-900/20 mt-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Activity className="text-slate-500" size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">Preview unavailable until evaluation</h3>
              <p className="text-sm text-slate-500 max-w-md">
                The AegisGrid backend does not provide preview simulation data before an evaluation run is initiated. 
                Running the evaluation engine will generate deterministic supply gap curves, reserve depletion metrics, and candidate responses.
              </p>
              
              <div className="mt-8 pt-6 border-t border-slate-800 w-full max-w-md">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <span>Draft</span>
                  <span>Evaluating</span>
                  <span>Completed</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="w-1/6 bg-blue-500 h-full"></div>
                </div>
                <p className="text-xs text-slate-500 mt-3 italic">
                  Once evaluation begins, scenario parameters become immutable.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleEvaluate}
                disabled={loading || !name || !description}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 disabled:text-blue-200/50 text-white rounded font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Initializing Engine...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Evaluate Scenario
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
