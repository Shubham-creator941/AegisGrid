import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Target, 
  BrainCircuit, 
  ShieldCheck, 
  Activity, 
  Clock, 
  MapPin, 
  Tag, 
  Database,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export function EventWorkspace() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      
      {/* 1. HEADER SECTION */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#FF4545]/10 border border-[#FF4545]/30 text-[#FF4545]">
              <ShieldAlert size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">CRITICAL</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-2 py-1 rounded bg-[#121D34] border border-[#1E304D] text-[#91A4BF]">
              <span className="text-[10px] font-bold uppercase tracking-wider">ANALYZED</span>
            </div>
            <button 
              onClick={() => navigate('/app/scenarios?eventId=ev-1')}
              className="flex items-center gap-2 bg-[#2F8CFF] hover:bg-[#3FA0FF] text-white px-4 py-1.5 rounded-md font-medium text-xs transition-all shadow-[0_0_10px_rgba(47,140,255,0.2)] hover:shadow-[0_0_15px_rgba(47,140,255,0.4)]"
            >
              Analyze in Scenarios
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#E6EDF7] mb-1">Strait of Hormuz Blockade</h2>
        <p className="text-sm text-[#91A4BF] mb-6">Naval blockade in the Strait of Hormuz disrupting maritime traffic.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#121D34] border border-[#1E304D] rounded-lg p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#657994] mb-2">
              <Clock size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">DETECTED</span>
            </div>
            <div className="text-sm font-semibold text-[#E6EDF7]">23/8/2026 02:50 PM</div>
          </div>
          
          <div className="bg-[#121D34] border border-[#1E304D] rounded-lg p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#657994] mb-2">
              <MapPin size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">LOCATION</span>
            </div>
            <div className="text-sm font-semibold text-[#E6EDF7]">Strait of Hormuz</div>
          </div>

          <div className="bg-[#121D34] border border-[#1E304D] rounded-lg p-4 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-[#657994] mb-2">
              <Tag size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">EVENT TYPE</span>
            </div>
            <div className="text-sm font-semibold text-[#E6EDF7]">GEOPOLITICAL</div>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CONFIRMED FACTS */}
            <div className="bg-[#0E172B] border border-[#1E304D] rounded-xl p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Database size={16} className="text-[#2F8CFF]" />
                <h3 className="text-xs font-bold text-[#E6EDF7] tracking-wider uppercase">CONFIRMED FACTS</h3>
              </div>
              
              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-bold text-[#657994] tracking-wider uppercase mb-1">EVENT DESCRIPTION</div>
                  <div className="text-sm text-[#E6EDF7]">Naval blockade in the Strait of Hormuz disrupting maritime traffic.</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] font-bold text-[#657994] tracking-wider uppercase mb-1">LOCATION</div>
                    <div className="text-sm text-[#E6EDF7]">Strait of Hormuz</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#657994] tracking-wider uppercase mb-1">DETECTED TIME</div>
                    <div className="text-sm text-[#E6EDF7]">23/8/2026, 2:50:47 PM</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#657994] tracking-wider uppercase mb-2">AFFECTED CORRIDORS</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded bg-[#121D34] border border-[#2F8CFF]/30 text-[#2F8CFF] text-xs font-medium">Strait of Hormuz</span>
                    <span className="px-2.5 py-1 rounded bg-[#121D34] border border-[#2F8CFF]/30 text-[#2F8CFF] text-xs font-medium">Gulf → Arabian Sea</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-[#657994] tracking-wider uppercase mb-1">AFFECTED ASSETS</div>
                  <div className="text-sm text-[#91A4BF]">Naval Traffic, Tankers, Energy Exports</div>
                </div>
              </div>
            </div>

            {/* RISK / IMPACT */}
            <div className="bg-[#0E172B] border border-[#1E304D] rounded-xl p-5 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-6 self-start w-full">
                <Target size={16} className="text-[#FFB000]" />
                <h3 className="text-xs font-bold text-[#E6EDF7] tracking-wider uppercase">RISK / IMPACT</h3>
              </div>
              
              <div className="text-[10px] font-bold text-[#657994] tracking-wider uppercase mb-6 self-start">IMPACT RADIUS</div>
              
              {/* Concentric Rings Visualization */}
              <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                {/* Secondary (1000NM) */}
                <div className="absolute inset-0 rounded-full border border-[#FFB000]/20 flex items-center justify-center transition-all hover:border-[#FFB000]/50 hover:bg-[#FFB000]/5" title="Secondary Impact (1000 NM)">
                  {/* Extended (650NM) */}
                  <div className="w-36 h-36 rounded-full border border-[#FF7B00]/40 flex items-center justify-center transition-all hover:border-[#FF7B00]/70 hover:bg-[#FF7B00]/10" title="Extended Impact (650 NM)">
                    {/* Direct (350NM) */}
                    <div className="w-24 h-24 rounded-full border border-[#FF4545]/60 flex items-center justify-center bg-[#FF4545]/10 shadow-[0_0_20px_rgba(255,69,69,0.2)] transition-all hover:border-[#FF4545] hover:bg-[#FF4545]/20" title="Direct Impact (350 NM)">
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#E6EDF7] leading-none">350</div>
                        <div className="text-[10px] text-[#FF4545] font-bold mt-1">NM</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Legend positioned absolute relative to rings container */}
                <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FF4545]"></div>
                    <div className="text-[9px] text-[#91A4BF] leading-tight">Direct Impact<br/><span className="text-[#E6EDF7] font-semibold">350 NM</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FF7B00]"></div>
                    <div className="text-[9px] text-[#91A4BF] leading-tight">Extended Impact<br/><span className="text-[#E6EDF7] font-semibold">650 NM</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#FFB000]"></div>
                    <div className="text-[9px] text-[#91A4BF] leading-tight">Secondary Impact<br/><span className="text-[#E6EDF7] font-semibold">1000 NM</span></div>
                  </div>
                </div>
              </div>

              <div className="w-full pt-4 border-t border-[#1E304D]">
                <div className="text-[10px] font-bold text-[#657994] tracking-wider uppercase mb-1">IMPACTED VOLUME</div>
                <div className="text-xl font-bold text-[#E6EDF7]">18.4M <span className="text-sm font-medium text-[#91A4BF]">bbl/d</span></div>
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="bg-[#0E172B] border border-[#1E304D] rounded-xl p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#E6EDF7]" />
                <h3 className="text-xs font-bold text-[#E6EDF7] tracking-wider uppercase">TIMELINE</h3>
              </div>
            </div>

            <div className="relative pt-2 pb-6 px-4 overflow-x-auto">
              {/* Connecting Line */}
              <div className="absolute top-[17px] left-8 right-8 h-[2px] bg-[#1E304D] z-0"></div>
              
              <div className="flex items-start justify-between min-w-[500px] relative z-10">
                {/* Stage 1 - Origin/Critical */}
                <div className="flex flex-col items-center group relative">
                  <div className="absolute top-1.5 w-full h-[2px] right-1/2 bg-[#FF4545] opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                  <div className="w-[18px] h-[18px] rounded-full bg-[#FF4545] border-4 border-[#0E172B] shadow-[0_0_0_2px_rgba(255,69,69,0.3)] mb-3 z-10"></div>
                  <div className="text-[10px] font-bold text-[#FF4545] mb-1">02:50 PM</div>
                  <div className="text-[11px] font-medium text-[#E6EDF7]">Event Detected</div>
                </div>

                {/* Stage 2 */}
                <div className="flex flex-col items-center">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#2F8CFF] border-4 border-[#0E172B] mb-3 z-10"></div>
                  <div className="text-[10px] font-bold text-[#91A4BF] mb-1">03:10 PM</div>
                  <div className="text-[11px] font-medium text-[#91A4BF]">Initial Assessment</div>
                </div>

                {/* Stage 3 */}
                <div className="flex flex-col items-center">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#2F8CFF] border-4 border-[#0E172B] mb-3 z-10"></div>
                  <div className="text-[10px] font-bold text-[#91A4BF] mb-1">03:25 PM</div>
                  <div className="text-[11px] font-medium text-[#91A4BF]">Risk Analysis</div>
                </div>

                {/* Stage 4 */}
                <div className="flex flex-col items-center">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#1E304D] border-4 border-[#0E172B] mb-3 z-10"></div>
                  <div className="text-[10px] font-bold text-[#657994] mb-1">03:40 PM</div>
                  <div className="text-[11px] font-medium text-[#657994]">Impact Modeling</div>
                </div>

                {/* Stage 5 */}
                <div className="flex flex-col items-center">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#1E304D] border-4 border-[#0E172B] mb-3 z-10"></div>
                  <div className="text-[10px] font-bold text-[#657994] mb-1">04:00 PM</div>
                  <div className="text-[11px] font-medium text-[#657994]">Intelligence Update</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <button className="flex items-center gap-1.5 text-xs text-[#2F8CFF] hover:text-[#E6EDF7] transition-colors font-medium">
                View Full Timeline
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* CURRENT STATUS */}
          <div className="bg-[#0E172B] border border-[#1E304D] rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#20C77A]/10 border border-[#20C77A]/30 flex items-center justify-center text-[#20C77A]">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-bold text-[#E6EDF7] tracking-wider uppercase">CURRENT STATUS</h3>
                    <span className="px-2 py-0.5 rounded bg-[#20C77A]/10 text-[#20C77A] text-[10px] font-bold tracking-wider uppercase border border-[#20C77A]/20">ACTIVE</span>
                  </div>
                  <p className="text-xs text-[#91A4BF]">Event is ongoing. Continuous monitoring and intelligence updates in progress.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-xs text-[#657994]">
                <div>
                  <div className="font-semibold text-[#91A4BF]">Continuous</div>
                  <div className="text-[10px] uppercase tracking-wider">Monitoring</div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-[#1E304D]"></div>
                <div>
                  <div className="font-semibold text-[#91A4BF]">04:00 PM</div>
                  <div className="text-[10px] uppercase tracking-wider">Last Update</div>
                </div>
                <div className="hidden sm:block w-px h-8 bg-[#1E304D]"></div>
                <div>
                  <div className="font-semibold text-[#91A4BF]">04:30 PM</div>
                  <div className="text-[10px] uppercase tracking-wider">Next Review</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* AI INFERENCE */}
          <div className="bg-[#0E172B] border border-[#1E304D] rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#1E304D] flex items-center justify-between bg-[#121D34]/50">
              <div className="flex items-center gap-2">
                <BrainCircuit size={16} className="text-[#B45CFF]" />
                <h3 className="text-xs font-bold text-[#E6EDF7] tracking-wider uppercase">AI INFERENCE</h3>
              </div>
              <div className="flex gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] text-[#657994] font-bold uppercase tracking-widest">MODEL: AEGIS INTELLIGENCE V2.1</span>
                </div>
                <div className="flex flex-col items-end pl-3 border-l border-[#1E304D]">
                  <span className="text-[8px] text-[#657994] font-bold uppercase tracking-widest">CONFIDENCE:</span>
                  <span className="text-[10px] text-[#E6EDF7] font-mono">90.0%</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[#060B18] text-xs font-mono overflow-x-auto leading-relaxed h-full whitespace-nowrap">
              <span className="text-[#91A4BF]">{'{'}</span><br/>
              <span className="text-[#657994]">  "threat_level": </span><span className="text-[#FFB000]">"HIGH"</span><span className="text-[#91A4BF]">,</span><br/>
              <span className="text-[#657994]">  "impact_duration": </span><span className="text-[#32B7FF]">"30_DAYS"</span><span className="text-[#91A4BF]">,</span><br/>
              <span className="text-[#657994]">  "affected_nodes": </span><span className="text-[#91A4BF]">[</span><br/>
              <span className="text-[#20C77A]">    "cor-1"</span><span className="text-[#91A4BF]">,</span><br/>
              <span className="text-[#20C77A]">    "port-7"</span><span className="text-[#91A4BF]">,</span><br/>
              <span className="text-[#20C77A]">    "route-12"</span><br/>
              <span className="text-[#91A4BF]">  ],</span><br/>
              <span className="text-[#657994]">  "probability": </span><span className="text-[#B45CFF]">0.90</span><span className="text-[#91A4BF]">,</span><br/>
              <span className="text-[#657994]">  "recommendation": </span><span className="text-[#32B7FF]">"Activate alternative routing via Saudi East-West bypass"</span><br/>
              <span className="text-[#91A4BF]">{'}'}</span>
            </div>
          </div>

          {/* RISK METRICS */}
          <div className="bg-[#0E172B] border border-[#1E304D] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <Activity size={16} className="text-[#32B7FF]" />
              <h3 className="text-xs font-bold text-[#E6EDF7] tracking-wider uppercase">RISK METRICS</h3>
            </div>
            
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-[#1E304D]/50">
                <span className="text-[#91A4BF]">Risk Level</span>
                <span className="px-2 py-0.5 bg-[#FF4545]/10 text-[#FF4545] border border-[#FF4545]/20 rounded text-[10px] font-bold uppercase tracking-wider">CRITICAL</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#1E304D]/50">
                <span className="text-[#91A4BF]">Exposure Index</span>
                <span className="text-[#E6EDF7] font-semibold">0.85</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#1E304D]/50">
                <span className="text-[#91A4BF]">Severity</span>
                <span className="text-[#E6EDF7] font-semibold">0.95</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#1E304D]/50">
                <span className="text-[#91A4BF]">Confidence</span>
                <span className="text-[#E6EDF7] font-semibold">90.0%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-[#1E304D]/50">
                <span className="text-[#91A4BF]">Volume at Risk</span>
                <span className="text-[#E6EDF7] font-semibold">18.4M bbl/d</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#91A4BF]">Potential Impact Duration</span>
                <span className="text-[#E6EDF7] font-semibold">30 Days</span>
              </div>
            </div>
          </div>

          {/* RECOMMENDED ACTIONS */}
          <div className="bg-[#0E172B] border border-[#1E304D] rounded-xl p-5 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-5">
              <ShieldCheck size={16} className="text-[#32B7FF]" />
              <h3 className="text-xs font-bold text-[#E6EDF7] tracking-wider uppercase">RECOMMENDED ACTIONS</h3>
            </div>
            
            <ul className="flex-1 space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#20C77A] mt-1.5 shrink-0 shadow-[0_0_5px_rgba(32,199,122,0.5)]"></div>
                <span className="text-xs text-[#E6EDF7] leading-relaxed">Monitor naval movements in the area</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#20C77A] mt-1.5 shrink-0 shadow-[0_0_5px_rgba(32,199,122,0.5)]"></div>
                <span className="text-xs text-[#E6EDF7] leading-relaxed">Evaluate alternative routing options</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#20C77A] mt-1.5 shrink-0 shadow-[0_0_5px_rgba(32,199,122,0.5)]"></div>
                <span className="text-xs text-[#E6EDF7] leading-relaxed">Prepare contingency supply plans</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#20C77A] mt-1.5 shrink-0 shadow-[0_0_5px_rgba(32,199,122,0.5)]"></div>
                <span className="text-xs text-[#E6EDF7] leading-relaxed">Increase intelligence collection frequency</span>
              </li>
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-[#1E304D] mt-auto">
              <button 
                onClick={() => navigate('/app/scenarios?eventId=ev-1')}
                className="flex items-center gap-2 bg-[#2F8CFF] hover:bg-[#3FA0FF] text-white px-3 py-1.5 rounded-md font-medium text-[11px] transition-all shadow-[0_0_10px_rgba(47,140,255,0.1)] hover:shadow-[0_0_15px_rgba(47,140,255,0.3)]"
              >
                Open Scenario Analysis
                <ArrowRight size={12} />
              </button>
              <button className="flex items-center gap-1.5 text-[11px] text-[#2F8CFF] hover:text-[#E6EDF7] transition-colors font-medium bg-[#121D34] px-3 py-1.5 rounded border border-[#1E304D]">
                View All Recommendations
                <ChevronRight size={12} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
