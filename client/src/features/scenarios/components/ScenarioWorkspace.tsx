import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useScenario } from '../hooks/useScenarios';
import { 
  Play, 
  AlertCircle, 
  Info, 
  Activity, 
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  MapPin
} from 'lucide-react';

export default function ScenarioWorkspace() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const navigate = useNavigate();
  const user = { id: 'USR-1' };
  
  const { createScenario, evaluateScenario, loading, error } = useScenario();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedScenarioOption, setSelectedScenarioOption] = useState<string | null>(null);

  // Hardcode the active event context per the requirements since the demo data might not have these specific fields
  const activeEvent = {
    id: eventId || 'ev-1',
    title: 'Strait of Hormuz Blockade',
    type: 'GEOPOLITICAL',
    severity: 'CRITICAL',
    location: 'Strait of Hormuz',
    threatLevel: 'HIGH',
    exposureIndex: '0.85',
    impactDuration: '30 Days',
    volumeAtRisk: '18.4M bbl/d'
  };

  const prePopulatedOptions = [
    {
      id: 'opt-1',
      title: 'Reroute via Saudi East-West Pipeline',
      type: 'REROUTE',
      feasibility: 'FEASIBLE',
      score: 85.50
    },
    {
      id: 'opt-2',
      title: 'Divert via Red Sea Route',
      type: 'REROUTE',
      feasibility: 'FEASIBLE',
      score: 78.20
    },
    {
      id: 'opt-3',
      title: 'Release Strategic Reserves',
      type: 'STRATEGIC_RESERVE',
      feasibility: 'FEASIBLE',
      score: 72.00
    },
    {
      id: 'opt-4',
      title: 'Reduce / Rebalance Maritime Exposure',
      type: 'CAPACITY_ADJUSTMENT',
      feasibility: 'CONDITIONAL',
      score: 68.40
    }
  ];

  useEffect(() => {
    if (activeEvent && selectedScenarioOption) {
      const opt = prePopulatedOptions.find(o => o.id === selectedScenarioOption);
      if (opt) {
        setName(`Mitigation: ${opt.title}`);
        setDescription(`Evaluating ${opt.type} strategy in response to ${activeEvent.title}. Projected viability score: ${opt.score}.`);
      }
    } else if (activeEvent && !selectedScenarioOption) {
      setName(`Scenario for: ${activeEvent.title}`);
      setDescription(`Evaluating response strategies for geopolitical event concerning ${activeEvent.location}.`);
    }
  }, [selectedScenarioOption]);

  const handleEvaluate = async () => {
    if (!name || !description || !eventId || !user) return;
    
    try {
      const scenario = await createScenario({
        name,
        description,
        event_id: eventId,
        created_by: user.id
      });
      
      const idempotencyKey = `eval_${scenario.id}_${Date.now()}`;
      const evalResult = await evaluateScenario(scenario.id, idempotencyKey);
      
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
      <div className="flex flex-col items-center justify-center h-full text-[#657994] bg-[#060B18]">
        <AlertCircle size={48} className="mb-4 opacity-50 text-[#FF4545]" />
        <h2 className="text-xl font-medium text-[#E6EDF7]">No Event Selected</h2>
        <p className="mt-2 text-center max-w-md">
          A scenario must be linked to a specific disruption event. Please select an event from the Network Overview to begin scenario engineering.
        </p>
        <button 
          onClick={() => navigate('/app/events')}
          className="mt-6 px-4 py-2 bg-[#2F8CFF] hover:bg-[#3FA0FF] text-white rounded transition-colors font-medium shadow-[0_0_10px_rgba(47,140,255,0.2)]"
        >
          View Events
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full bg-[#060B18] text-[#E6EDF7] font-sans">
      
      {/* BREADCRUMB / BACK NAVIGATION */}
      <div className="mb-4">
        <button 
          onClick={() => navigate('/app/events')}
          className="flex items-center gap-1.5 text-xs text-[#91A4BF] hover:text-[#E6EDF7] transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Events
        </button>
      </div>

      {/* CONTEXTUAL HEADER */}
      <div className="bg-[#0B1224] border border-[#1E304D] rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-[#657994] tracking-widest uppercase">SCENARIO ANALYSIS</span>
            </div>
            <h1 className="text-2xl font-semibold text-[#E6EDF7] mb-1">
              Based on: {activeEvent.title}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#FF4545]/10 border border-[#FF4545]/30 text-[#FF4545]">
                <ShieldAlert size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{activeEvent.severity}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#121D34] border border-[#1E304D] text-[#91A4BF]">
                <MapPin size={12} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{activeEvent.location}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#121D34] border border-[#1E304D] text-[#91A4BF]">
                <span className="text-[10px] font-bold uppercase tracking-wider">{activeEvent.type}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-2 md:pt-0 border-t md:border-t-0 md:border-l border-[#1E304D] md:pl-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#657994] uppercase tracking-wider">THREAT LEVEL</span>
              <span className="text-[#FFB000] font-semibold text-sm">{activeEvent.threatLevel}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#657994] uppercase tracking-wider">EXPOSURE INDEX</span>
              <span className="text-[#E6EDF7] font-semibold text-sm">{activeEvent.exposureIndex}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-[#657994] uppercase tracking-wider">VOLUME AT RISK</span>
              <span className="text-[#E6EDF7] font-semibold text-sm">{activeEvent.volumeAtRisk}</span>
            </div>
          </div>

        </div>
      </div>

      {error && (
        <div className="bg-[#FF4545]/10 border border-[#FF4545]/30 rounded-lg p-4 flex items-start gap-3 mb-6">
          <AlertCircle className="text-[#FF4545] mt-0.5" size={18} />
          <div>
            <h3 className="text-sm font-medium text-[#FF4545]">Scenario Configuration Failed</h3>
            <p className="text-sm text-[#FF4545]/80 mt-1">{error.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* PRE-POPULATED OPTIONS */}
        <div className="lg:col-span-7 bg-[#0B1224] border border-[#1E304D] rounded-xl shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#1E304D] bg-[#0E172B] flex items-center gap-2">
            <Activity size={16} className="text-[#32B7FF]" />
            <h2 className="text-xs font-bold text-[#E6EDF7] tracking-wider uppercase">GENERATED MITIGATION SCENARIOS</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {prePopulatedOptions.map((opt, idx) => {
              const isSelected = selectedScenarioOption === opt.id;
              
              let feasibilityColor = 'text-[#20C77A]';
              let feasibilityBg = 'bg-[#20C77A]/10 border-[#20C77A]/30';
              if (opt.feasibility === 'CONDITIONAL') {
                feasibilityColor = 'text-[#FFB000]';
                feasibilityBg = 'bg-[#FFB000]/10 border-[#FFB000]/30';
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedScenarioOption(opt.id)}
                  className={`w-full text-left p-5 rounded-lg border transition-all relative overflow-hidden flex items-center justify-between group ${
                    isSelected 
                      ? 'bg-[#121D34] border-[#2F8CFF] shadow-[0_0_15px_rgba(47,140,255,0.15)]' 
                      : 'bg-[#0E172B] border-[#1E304D] hover:border-[#2F8CFF]/50 hover:bg-[#121D34]/50'
                  }`}
                >
                  {/* Selected Indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isSelected ? 'bg-[#2F8CFF]' : 'bg-transparent'}`}></div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-[#060B18] border border-[#1E304D] text-[#91A4BF] font-semibold text-sm shadow-inner">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold mb-1.5 transition-colors ${isSelected ? 'text-[#2F8CFF]' : 'text-[#E6EDF7] group-hover:text-[#32B7FF]'}`}>
                        {opt.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-[#657994] uppercase tracking-wider bg-[#060B18] px-1.5 py-0.5 rounded border border-[#1E304D]">
                          {opt.type}
                        </span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${feasibilityColor} ${feasibilityBg}`}>
                          {opt.feasibility}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-bold text-[#657994] uppercase tracking-wider mb-1">VIABILITY SCORE</span>
                      <span className={`font-mono font-semibold ${isSelected ? 'text-[#2F8CFF]' : 'text-[#E6EDF7]'}`}>{opt.score.toFixed(2)}</span>
                    </div>
                    <ChevronRight size={18} className={isSelected ? 'text-[#2F8CFF]' : 'text-[#657994]'} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* EVALUATION WORKSPACE */}
        <div className="lg:col-span-5 bg-[#0B1224] border border-[#1E304D] rounded-xl shadow-lg flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[#1E304D] bg-[#0E172B] flex items-center gap-2">
            <FileText size={16} className="text-[#B45CFF]" />
            <h2 className="text-xs font-bold text-[#E6EDF7] tracking-wider uppercase">SCENARIO CONFIGURATION</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-[#657994] uppercase tracking-wider mb-2">Scenario Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#060B18] border border-[#1E304D] rounded px-3 py-2.5 text-sm text-[#E6EDF7] focus:outline-none focus:border-[#2F8CFF] transition-colors disabled:opacity-50"
                  placeholder="e.g., 30-Day Total Blockade"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-[#657994] uppercase tracking-wider mb-2">Operational Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  rows={4}
                  className="w-full bg-[#060B18] border border-[#1E304D] rounded px-3 py-2.5 text-sm text-[#E6EDF7] focus:outline-none focus:border-[#2F8CFF] transition-colors disabled:opacity-50 resize-none"
                  placeholder="Describe the nature of the disruption and expected operational impact..."
                />
              </div>
              
              <div className="bg-[#121D34]/50 border border-[#1E304D] rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={14} className="text-[#32B7FF]" />
                  <span className="text-xs font-bold text-[#E6EDF7] uppercase tracking-wider">Engine Notice</span>
                </div>
                <p className="text-xs text-[#91A4BF] leading-relaxed">
                  Detailed assumption variables (duration, flow reduction percentage, facility constraints) are managed internally by the Aegis simulation engine during the evaluation phase based on the selected AI mitigation option.
                </p>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t border-[#1E304D]">
              <button
                onClick={handleEvaluate}
                disabled={loading || !name || !description}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#2F8CFF] hover:bg-[#3FA0FF] disabled:bg-[#1E304D] disabled:text-[#657994] text-white rounded font-medium transition-all shadow-[0_0_10px_rgba(47,140,255,0.2)] hover:shadow-[0_0_15px_rgba(47,140,255,0.4)] disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Initializing Simulation Engine...
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    Execute Scenario Evaluation
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
