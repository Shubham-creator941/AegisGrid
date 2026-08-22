import { useState } from 'react';
import { BrainCircuit, Target, Shield, AlertTriangle, Play, Database, RefreshCw } from 'lucide-react';
import { useAIAnalysis, useRiskAssessment } from '../../events/hooks/useEvents';
import { EventsApi } from '../../events/api/events.api';
import type { Event } from '../../events/api/events.api';

interface AnalysisWorkspaceProps {
  event: Event;
}

export function AnalysisWorkspace({ event }: AnalysisWorkspaceProps) {
  const { data: analysis, loading: analysisLoading, error: analysisError } = useAIAnalysis(event.id);
  const { data: risk, loading: riskLoading, error: riskError } = useRiskAssessment(event.id);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localAnalysis, setLocalAnalysis] = useState(analysis);

  // We sync localAnalysis with fetched analysis to allow inline updates
  // without needing a full refetch if we manually trigger analysis
  const activeAnalysis = localAnalysis || analysis;

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      const res = await EventsApi.analyzeEvent(event.id);
      setLocalAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderSectionA = () => {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4 text-slate-300">
          <Database size={18} className="text-blue-400" />
          <h3 className="text-sm font-semibold tracking-wider uppercase">CONFIRMED FACTS</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Event Description</div>
            <div className="text-sm text-slate-300">{event.description}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Location</div>
              <div className="text-sm text-slate-300">{event.affected_region || 'Unknown Location'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Detected Time</div>
              <div className="text-sm text-slate-300">{new Date(event.detected_at).toLocaleString()}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Affected Corridors</div>
            <div className="text-sm text-slate-500 italic">Not available in event data</div>
          </div>
        </div>
      </div>
    );
  };

  const renderSectionB = () => {
    if (analysisLoading) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 min-h-[250px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <RefreshCw size={24} className="animate-spin text-blue-500" />
            <span className="text-sm">Loading AI Analysis...</span>
          </div>
        </div>
      );
    }

    if (analysisError) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="p-4 text-sm text-red-400 flex items-start gap-2 bg-red-400/10 rounded">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold mb-1">Unable to load AI analysis</div>
              <div className="text-xs opacity-80">{analysisError}</div>
            </div>
          </div>
        </div>
      );
    }

    if (!activeAnalysis) {
      return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 min-h-[250px] flex flex-col items-center justify-center text-center">
          <BrainCircuit size={32} className="text-slate-600 mb-3" />
          <h3 className="text-sm font-medium text-slate-300">AI analysis has not been generated for this event</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Run the AI inference engine to process evidence.</p>
          <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded transition-colors"
          >
            {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Event'}
          </button>
        </div>
      );
    }

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-300">
            <BrainCircuit size={18} className="text-purple-400" />
            <h3 className="text-sm font-semibold tracking-wider uppercase">AI INFERENCE</h3>
          </div>
          <div className="flex items-center gap-3 text-[10px] uppercase font-mono text-slate-400">
            <span className="bg-slate-800 px-2 py-1 rounded">Model: {activeAnalysis.model_name} {activeAnalysis.model_version}</span>
            <span className="bg-slate-800 px-2 py-1 rounded">Confidence: {activeAnalysis.confidence ? `${(activeAnalysis.confidence * 100).toFixed(1)}%` : 'N/A'}</span>
          </div>
        </div>

        <div className="text-sm text-slate-300 space-y-4">
          {activeAnalysis.structured_output ? (
            <div className="bg-slate-950 p-4 rounded font-mono text-xs whitespace-pre-wrap text-slate-400 border border-slate-800 overflow-x-auto">
              {JSON.stringify(activeAnalysis.structured_output, null, 2)}
            </div>
          ) : (
            <div className="text-slate-500 italic">No structured output available.</div>
          )}
          
          <div className="text-xs text-slate-500 text-right mt-2">
            Generated: {new Date(activeAnalysis.created_at).toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  const renderSectionC = () => {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4 text-slate-300">
          <Target size={18} className="text-amber-400" />
          <h3 className="text-sm font-semibold tracking-wider uppercase">RISK / IMPACT</h3>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* Impact Radius Area */}
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Impact Radius</div>
            <div className="bg-slate-950 border border-slate-800 rounded-lg h-40 flex items-center justify-center text-slate-500 text-sm italic">
              Impact radius unavailable from current analysis.
            </div>
          </div>

          {/* Exposure Summary */}
          <div>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Exposure Summary</div>
            
            {riskLoading ? (
               <div className="animate-pulse space-y-3">
                 <div className="h-4 bg-slate-800 rounded w-full"></div>
                 <div className="h-4 bg-slate-800 rounded w-2/3"></div>
               </div>
            ) : riskError ? (
               <div className="text-sm text-slate-500 italic">Risk assessment could not be retrieved.</div>
            ) : risk ? (
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Risk Level</span>
                  <span className="text-slate-200 font-bold">{risk.risk_level}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Exposure Index</span>
                  <span className="text-slate-200">{risk.exposure}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Severity</span>
                  <span className="text-slate-200">{risk.severity}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Confidence</span>
                  <span className="text-slate-200">{risk.confidence ? `${(risk.confidence * 100).toFixed(1)}%` : 'Unavailable'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Volume at risk</span>
                  <span className="text-slate-500 italic text-xs">Not available</span>
                </div>
                <div className="text-xs text-slate-500 mt-2 font-sans whitespace-pre-wrap">
                  {risk.assessment_basis}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic">No risk assessment is available for this event.</div>
            )}
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-auto pt-6">
          <button 
            disabled
            className="w-full flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 py-3 rounded-lg text-sm font-semibold opacity-60 cursor-not-allowed"
          >
            <Shield size={16} />
            Generate Response Scenarios
          </button>
          <p className="text-center text-[10px] text-slate-500 mt-2">Scenario generation not yet available</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Facts & Inference */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {renderSectionA()}
          {renderSectionB()}
        </div>

        {/* Right Column: Risk / Impact */}
        <div className="xl:col-span-1">
          {renderSectionC()}
        </div>

      </div>
    </div>
  );
}
