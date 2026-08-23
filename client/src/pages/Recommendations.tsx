import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import type { EvaluationResult } from '../features/evaluations/api/evaluations.api';
import { EvaluationsApi } from '../features/evaluations/api/evaluations.api';
import { DecisionsApi } from '../features/decisions/api/decisions.api';
import { DecisionType } from 'shared';
import { CheckCircle, AlertTriangle, AlertCircle, ArrowLeft, Activity, Info } from 'lucide-react';
import { useNetworkOverview } from '../features/network/hooks/useNetwork';
import { GeographicMap } from '../features/network/components/GeographicMap';
import { USE_DEMO_DATA } from '../config/demo.config';

export default function Recommendations() {
  const [searchParams] = useSearchParams();
  const evaluationId = searchParams.get('evaluationId') || (USE_DEMO_DATA ? 'eval-1' : null);
  const navigate = useNavigate();

  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  
  // Decision state
  const [currentDecision, setCurrentDecision] = useState<any>(null);
  const [decisionReason, setDecisionReason] = useState<string>('');
  const [decisionStatus, setDecisionStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: networkData, loading: networkLoading } = useNetworkOverview();

  useEffect(() => {
    if (!evaluationId) {
      setError('No Evaluation ID provided.');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await EvaluationsApi.getEvaluationResult(evaluationId);
        setEvaluationResult(result);

        if (result.recommendation) {
          setSelectedCandidateId(result.recommendation.response_candidate_id);
          
          // Check for existing decision
          try {
            const decisionData = await DecisionsApi.getDecision(result.recommendation.id);
            if (decisionData?.success && decisionData.data?.decision) {
              setCurrentDecision(decisionData.data.decision);
            }
          } catch (e) {
            // Ignore 404s for decision not found
            console.log('No existing decision found');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load evaluation results.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [evaluationId]);

  const handleDecision = async (decisionType: DecisionType) => {
    if (!evaluationResult?.recommendation?.id) return;
    if (!selectedCandidateId) return;
    
    if (decisionType !== 'ACCEPT' && !decisionReason.trim()) {
      setDecisionStatus('Error: Rationale is required for MODIFY and REJECT');
      return;
    }

    try {
      setSubmitting(true);
      setDecisionStatus(null);
      const res = await DecisionsApi.makeDecision(evaluationResult.recommendation.id, {
        decision: decisionType,
        selected_response_id: selectedCandidateId,
        rationale: decisionReason || 'Accepted system recommendation.'
      });
      if (res.success) {
        setCurrentDecision(res.data);
        setDecisionStatus('Decision recorded successfully.');
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setDecisionStatus('Error: Unauthorized to make decisions. Role restriction applies.');
      } else {
        setDecisionStatus(`Error: ${err.message || 'Failed to submit decision'}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || networkLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-400 flex items-center gap-2">
          <Activity className="animate-spin" /> Loading recommendation comparison...
        </div>
      </div>
    );
  }

  if (error || !evaluationResult) {
    return (
      <div className="h-full p-6">
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-300">Error Loading Data</h3>
            <p className="text-sm mt-1">{error}</p>
            <button onClick={() => navigate('/app/evaluations')} className="mt-3 text-sm text-red-300 underline">Return to Evaluations</button>
          </div>
        </div>
      </div>
    );
  }

  const { recommendation, responses, constraints, scores, ranking } = evaluationResult;
  const selectedCandidate = responses.find(r => r.id === selectedCandidateId);
  const selectedConstraint = constraints.find(c => c.response_candidate_id === selectedCandidateId);
  const selectedScore = scores.find(s => s.response_candidate_id === selectedCandidateId);
  const selectedRank = ranking.find(r => r.candidate.id === selectedCandidateId);

  // Identify if selected is the recommended
  const isSelectedRecommended = recommendation && recommendation.response_candidate_id === selectedCandidateId;

  return (
    <div className="h-full flex flex-col space-y-6 max-w-[1600px] mx-auto p-6 pb-12 overflow-y-auto w-full">
      {/* Header */}
      <div>
        <Link to={`/app/evaluations?scenarioId=${evaluationResult.evaluation.scenario_id}`} className="text-sm text-slate-400 hover:text-slate-200 flex items-center gap-1 mb-4 transition-colors">
          <ArrowLeft size={16} /> Back to Evaluation
        </Link>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3 mb-1">
          Recommendation Comparison
        </h1>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest flex items-center gap-4">
          <span>Evaluation ID: <span className="font-mono text-slate-300">{evaluationResult.evaluation.id?.split('-')[0] || 'N/A'}</span></span>
          <span className="opacity-50">|</span>
          <span>Scenario: <span className="font-mono text-slate-300">{evaluationResult.evaluation.scenario_id?.split('-')[0] || 'N/A'}</span></span>
        </p>
      </div>

      {!recommendation ? (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl text-center">
          <Info className="mx-auto text-slate-500 mb-3" size={32} />
          <h3 className="text-lg font-medium text-slate-300">No Recommendation Available</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            The evaluation did not produce a final system recommendation. This may occur if no candidates were feasible or if the engine failed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] xl:grid-cols-[60%_40%] gap-6">
          
          {/* LEFT: DECISION IMPACT */}
          <div className="space-y-4 flex flex-col">
            <div>
              <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-1">Decision Impact</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Network effect of selected response</p>
            </div>
            
            <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl overflow-hidden shadow-sm relative min-h-[450px] flex-1">
              <GeographicMap 
                suppliers={networkData?.suppliers || []}
                facilities={networkData?.facilities || []}
                corridors={networkData?.corridors || []}
                supplyFlows={networkData?.supplyFlows || []}
                highlightedNodeIds={selectedCandidate?.parameters?.affected_node_ids as string[] | undefined}
                isSelectedRecommended={isSelectedRecommended}
                selectedCandidateName={selectedCandidate?.name}
              />
            </div>
            
            {selectedCandidate ? (
              <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-5 shadow-sm mt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 border-b border-[#1E293B] pb-2 mb-4">Contextual Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase mb-1">Target Action</div>
                    <div className="text-sm font-medium text-slate-200">{selectedCandidate.action_type || 'N/A'}</div>
                  </div>
                  {selectedCandidate.parameters && Object.entries(selectedCandidate.parameters)
                    .filter(([key]) => key !== 'affected_node_ids')
                    .map(([key, value]) => (
                    <div key={key}>
                      <div className="text-[10px] text-slate-500 uppercase mb-1">{key.replace(/_/g, ' ')}</div>
                      <div className="text-sm font-mono text-slate-200">{String(value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#0B1120]/50 border border-[#1E293B]/50 rounded-xl p-5 text-center shadow-sm mt-2">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Select a candidate to view network impact</p>
              </div>
            )}
          </div>

          {/* RIGHT: CANDIDATES & DETAIL */}
          <div className="space-y-6 flex flex-col">
            {/* CANDIDATE LIST */}
            <div className="space-y-4 overflow-y-auto shrink-0 max-h-[350px] border border-[#1E293B] bg-[#0B1120]/50 rounded-xl p-5 shadow-inner">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 border-b border-[#1E293B] pb-2">Candidate Responses</h2>
            
            <div className="space-y-3">
              {responses.map(candidate => {
                const isRecommended = recommendation.response_candidate_id === candidate.id;
                const isSelected = selectedCandidateId === candidate.id;
                const cConstraint = constraints.find(c => c.response_candidate_id === candidate.id);
                const cScore = scores.find(s => s.response_candidate_id === candidate.id);
                const cRank = ranking.find(r => r.candidate.id === candidate.id);

                return (
                  <div 
                    key={candidate.id}
                    onClick={() => setSelectedCandidateId(candidate.id)}
                    className={`cursor-pointer border rounded-lg p-4 transition-all duration-200 ${
                      isSelected 
                        ? (isRecommended ? 'bg-status-recommended/10 border-status-recommended shadow-[0_0_15px_var(--color-status-recommended)]' : 'bg-[#1E293B] border-slate-500') 
                        : 'bg-[#0B1120] border-[#1E293B] hover:border-slate-600 hover:bg-[#0F172A]'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        {isRecommended && (
                          <span className="inline-flex items-center gap-1 bg-status-recommended/10 text-status-recommended text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 border border-status-recommended/30">
                            System Recommended
                          </span>
                        )}
                        <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>{candidate.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{candidate.action_type}</p>
                      </div>
                      <div className="text-right">
                        {cRank?.rank && (
                          <div className="text-lg font-bold text-slate-300">#{cRank.rank}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[#1E293B]">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Feasibility</div>
                        {cConstraint ? (
                          <div className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${cConstraint.feasible ? 'text-status-normal' : 'text-status-critical'}`}>
                            {cConstraint.feasible ? 'FEASIBLE' : 'INFEASIBLE'}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 mt-0.5">Unknown</div>
                        )}
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Score</div>
                        <div className="text-xs font-mono text-slate-300 mt-0.5">
                          {cScore?.overall_score != null ? Number(cScore.overall_score).toFixed(2) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase">Violations</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {cConstraint?.violations?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            </div>

            {/* Candidate Detail */}
            <div className="flex-1 overflow-y-auto">
            
            {/* Candidate Detail */}
            {selectedCandidate ? (
              <div className={`border rounded-xl overflow-hidden shadow-sm flex flex-col ${isSelectedRecommended ? 'border-status-recommended/30 shadow-[0_0_20px_var(--color-status-recommended)] bg-status-recommended/5' : 'border-[#1E293B] bg-[#0B1120]'}`}>
                <div className={`p-5 border-b shrink-0 ${isSelectedRecommended ? 'border-status-recommended/20 bg-status-recommended/10' : 'border-[#1E293B] bg-[#0F172A]/50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      {isSelectedRecommended && (
                        <div className="text-xs font-bold text-status-recommended uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <CheckCircle size={14} /> Recommended Response
                        </div>
                      )}
                      {!isSelectedRecommended && (
                        <div className="text-xs font-bold text-status-alternative uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          Alternative Response
                        </div>
                      )}
                      <h2 className="text-xl font-semibold text-slate-100">{selectedCandidate.name}</h2>
                      <p className="text-sm text-slate-400 mt-1">{selectedCandidate.description}</p>
                    </div>
                    {selectedRank?.rank && (
                      <div className="bg-[#0B1120] px-4 py-2 rounded-lg border border-[#1E293B] text-center shadow-inner">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rank</div>
                        <div className="text-xl font-light text-slate-200">#{selectedRank.rank}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 space-y-6 flex-1 overflow-y-auto">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#0B1120] p-4 rounded-lg border border-[#1E293B] shadow-inner">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Score</div>
                      <div className="text-xl font-light text-slate-200">{selectedScore?.overall_score != null ? Number(selectedScore.overall_score).toFixed(2) : 'N/A'}</div>
                    </div>
                    <div className="bg-[#0B1120] p-4 rounded-lg border border-[#1E293B] shadow-inner">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Feasibility</div>
                      <div className={`text-lg font-bold tracking-tight ${selectedConstraint?.feasible ? 'text-status-normal' : 'text-status-critical'}`}>
                        {selectedConstraint ? (selectedConstraint.feasible ? 'FEASIBLE' : 'INFEASIBLE') : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-[#0B1120] p-4 rounded-lg border border-[#1E293B] shadow-inner">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Confidence</div>
                      <div className="text-xl font-light text-status-recommended">
                        {isSelectedRecommended && recommendation.confidence != null ? `${(recommendation.confidence * 100).toFixed(0)}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-[#0B1120] p-4 rounded-lg border border-[#1E293B] shadow-inner">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Target Action</div>
                      <div className="text-sm font-semibold text-slate-300 mt-1">{selectedCandidate.action_type || 'N/A'}</div>
                    </div>
                  </div>

                  {/* Operational Details */}
                  {selectedCandidate.parameters && Object.keys(selectedCandidate.parameters).length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-[#1E293B] pb-2">
                        <Activity size={14} className="text-status-normal" /> Operational Parameters
                      </h4>
                      <div className="bg-[#0B1120] border border-[#1E293B] rounded-lg p-4 shadow-inner">
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                          {Object.entries(selectedCandidate.parameters).map(([key, value]) => (
                            <div key={key}>
                              <dt className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{key.replace(/_/g, ' ')}</dt>
                              <dd className="text-sm text-slate-200 font-medium">{String(value)}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  )}

                  {/* Constraint Violations */}
                  {selectedConstraint?.violations && selectedConstraint.violations.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-status-critical uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-[#1E293B] pb-2">
                        <AlertTriangle size={14} /> Constraint Violations
                      </h4>
                      <ul className="space-y-2">
                        {selectedConstraint.violations.map((v: string, i: number) => (
                          <li key={i} className="bg-status-critical/10 border border-status-critical/30 text-slate-300 text-sm px-3 py-2 rounded flex items-start gap-2">
                            <span className="mt-1 font-bold text-status-critical">·</span> {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Rationale & Trade-offs (Only for Recommended for now, or if ranking provides it) */}
                  {isSelectedRecommended && (
                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-[#1E293B]">
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">System Rationale</h4>
                        <p className="text-sm text-slate-400 leading-relaxed bg-[#0B1120] p-4 rounded-lg border border-[#1E293B] shadow-inner min-h-[80px]">
                          {recommendation.rationale || 'No explicit rationale provided by the engine.'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">Key Trade-offs</h4>
                        {recommendation.tradeoffs && recommendation.tradeoffs.length > 0 ? (
                          <ul className="text-sm text-slate-400 bg-[#0B1120] p-4 rounded-lg border border-[#1E293B] shadow-inner space-y-1.5 min-h-[80px]">
                            {recommendation.tradeoffs.map((t: any, i: number) => (
                              <li key={i} className="flex gap-2 items-start"><span className="text-slate-600">-</span> <span>{t}</span></li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-slate-500 italic bg-[#0B1120] p-4 rounded-lg border border-[#1E293B] shadow-inner min-h-[80px]">Not available from current evaluation.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border border-slate-800 bg-slate-900/30 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                <Info size={40} className="text-slate-700 mb-4" />
                <h3 className="text-lg font-medium text-slate-400">Select a Candidate</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-sm">Choose a response candidate from the left panel to view detailed operational metrics and constraint analysis.</p>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* DECISION INTERFACE */}
        <div className="border border-[#1E293B] bg-[#0B1120] rounded-xl overflow-hidden shadow-sm mt-6">
              <div className="bg-[#0F172A]/50 px-6 py-4 border-b border-[#1E293B]">
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-status-alternative shadow-[0_0_8px_var(--color-status-alternative)]"></div>
                  Human Decision Protocol
                </h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-semibold">
                  Operator must finalize the response selection. Actions recorded in secure audit log.
                </p>
              </div>

              <div className="p-6">
                {currentDecision ? (
                  <div className="bg-status-normal/10 border border-status-normal/30 rounded-lg p-6 text-center shadow-inner">
                    <CheckCircle className="text-status-normal mx-auto mb-3" size={36} />
                    <h3 className="text-lg font-bold text-status-normal">Decision Recorded</h3>
                    <p className="text-slate-300 mt-2">
                      <span className="font-bold text-white uppercase tracking-wider">{currentDecision.decision_type}</span> - Response ID: <span className="font-mono text-slate-400">{currentDecision.selected_response_id?.split('-')[0] || 'N/A'}</span>
                    </p>
                    <div className="mt-4 inline-block bg-[#0B1120] border border-[#1E293B] px-4 py-3 rounded-lg text-sm text-slate-400 text-left max-w-lg w-full shadow-inner">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Rationale</div>
                      {currentDecision.reason}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-[#0B1120] p-4 rounded-lg border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected Target</div>
                        <div className="text-sm font-bold text-slate-200 mt-1">{selectedCandidate?.name || 'None Selected'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action Type</div>
                        <div className={`text-sm font-bold uppercase tracking-wider mt-1 ${isSelectedRecommended ? 'text-status-recommended' : 'text-status-alternative'}`}>
                          {isSelectedRecommended ? 'ACCEPT SYSTEM RECOMMENDATION' : 'MODIFY / OVERRIDE'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-widest mb-2">
                        Operational Rationale <span className="text-slate-500 normal-case tracking-normal font-normal ml-2">(Required for overrides)</span>
                      </label>
                      <textarea 
                        className="w-full bg-[#0B1120] border border-[#1E293B] rounded-lg p-3 text-slate-200 focus:outline-none focus:border-status-alternative focus:ring-1 focus:ring-status-alternative transition-colors placeholder:text-slate-600 font-medium text-sm"
                        rows={3}
                        value={decisionReason}
                        onChange={e => setDecisionReason(e.target.value)}
                        placeholder="Document human reasoning for this decision..."
                      />
                    </div>

                    {decisionStatus && (
                      <div className={`p-3 rounded-lg text-sm flex items-start gap-2 border shadow-sm ${decisionStatus.startsWith('Error') ? 'bg-status-critical/10 text-status-critical border-status-critical/30' : 'bg-status-normal/10 text-status-normal border-status-normal/30'}`}>
                        {decisionStatus.startsWith('Error') ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> : <CheckCircle size={16} className="mt-0.5 shrink-0" />}
                        {decisionStatus}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-6 border-t border-[#1E293B]">
                      <button 
                        onClick={() => handleDecision(DecisionType.ACCEPT)}
                        disabled={submitting || !isSelectedRecommended}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all ${
                          isSelectedRecommended 
                            ? 'bg-status-recommended hover:bg-status-recommended/90 text-[#060B14] shadow-[0_0_15px_var(--color-status-recommended)] shadow-opacity-30' 
                            : 'bg-[#0B1120] text-slate-500 cursor-not-allowed border border-[#1E293B]'
                        }`}
                        title={!isSelectedRecommended ? 'Select the recommended response to ACCEPT' : ''}
                      >
                        ACCEPT RECOMMENDATION
                      </button>
                      
                      <button 
                        onClick={() => handleDecision(DecisionType.MODIFY)}
                        disabled={submitting || isSelectedRecommended}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-[11px] uppercase tracking-widest transition-all ${
                          !isSelectedRecommended && selectedCandidateId
                            ? 'bg-status-alternative hover:bg-status-alternative/90 text-[#060B14] shadow-[0_0_15px_var(--color-status-alternative)] shadow-opacity-30' 
                            : 'bg-[#0B1120] text-slate-500 cursor-not-allowed border border-[#1E293B]'
                        }`}
                        title={isSelectedRecommended ? 'Select an alternative response to MODIFY' : ''}
                      >
                        MODIFY RESPONSE
                      </button>

                      <button 
                        onClick={() => handleDecision(DecisionType.REJECT)}
                        disabled={submitting}
                        className="flex-none w-full sm:w-auto py-3 px-6 rounded-lg font-bold text-[11px] uppercase tracking-widest bg-[#0B1120] hover:bg-status-critical/20 text-status-critical border border-[#1E293B] hover:border-status-critical/50 transition-all"
                      >
                        REJECT ALL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

        </div>
      )}
    </div>
  );
}
