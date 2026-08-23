import { ShieldAlert, TrendingUp, ArrowRight } from 'lucide-react';
import type { Supplier, SupplyFlow, Facility, Corridor } from '../api/network.api';
import { GeographicMap } from './GeographicMap';

interface Props {
  supplier: Supplier;
  facilities: Facility[];
  corridors: Corridor[];
  supplyFlows: SupplyFlow[];
}

export function SupplierDetails({ supplier, facilities, corridors, supplyFlows }: Props) {
  // Find related flows
  const relatedFlows = supplyFlows.filter(f => f.supplier_id === supplier.id);
  
  return (
    <div className="flex flex-col h-full bg-aegis-base">
      {/* Header */}
      <div className="p-6 border-b border-aegis-border bg-aegis-panel flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-aegis-border">
            {/* simple flag placeholder */}
            <div className="text-[10px] font-bold text-slate-800">{supplier.country}</div>
          </div>
          <div>
            <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-0.5">SUPPLIER</div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{supplier.name}</h2>
            </div>
            <div className="text-aegis-text-secondary text-xs mt-1">{supplier.country} • {supplier.supplier_type.charAt(0) + supplier.supplier_type.slice(1).toLowerCase()}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-aegis-green/20 text-aegis-green border border-aegis-green/30 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-aegis-green"></span>
            Operational
          </span>
          <button className="bg-transparent hover:bg-aegis-blue/10 text-aegis-blue border border-aegis-blue/50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <ShieldAlert size={16} />
            Simulate Disruption
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4">
            <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-2">CURRENT SUPPLY</div>
            <div className="text-2xl font-bold text-white mb-1">{supplier.current_supply || '0.00M'} <span className="text-sm font-normal text-aegis-text-secondary">bbl/d</span></div>
            <div className="flex items-center text-xs text-aegis-green">
              vs yesterday <TrendingUp size={12} className="ml-1 mr-0.5"/> 2.4%
            </div>
          </div>
          <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4">
            <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-2">NETWORK SHARE</div>
            <div className="text-2xl font-bold text-white mb-1">{supplier.supply_share || '0%'}</div>
            <div className="text-xs text-aegis-text-secondary">of total supply</div>
          </div>
          <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4">
            <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-2">ACTIVE ROUTES</div>
            <div className="text-2xl font-bold text-white mb-1">{supplier.active_routes || 0}</div>
            <div className="text-xs text-aegis-text-secondary">live routes</div>
          </div>
          <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4">
            <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-2">RISK EXPOSURE</div>
            <div className="flex items-end gap-2 mb-1">
              <div className={`text-2xl font-bold ${(supplier.risk_score || 0) > 60 ? 'text-aegis-red' : 'text-aegis-yellow'}`}>{supplier.risk_score || 0}</div>
              {(supplier.risk_score || 0) > 60 && <span className="text-[9px] font-bold bg-aegis-red/20 text-aegis-red px-1.5 py-0.5 rounded border border-aegis-red/30 mb-1.5">CRITICAL</span>}
            </div>
            <div className="flex items-center text-xs text-aegis-red">
              vs yesterday <TrendingUp size={12} className="ml-1 mr-0.5"/> {supplier.risk_trend || 0}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Map Area */}
          <div className="col-span-2 space-y-4">
            <div className="flex flex-col h-[320px] bg-aegis-panel rounded-xl overflow-hidden border border-aegis-border relative">
              <div className="absolute top-4 left-4 z-10">
                 <div className="text-[10px] font-bold text-aegis-blue uppercase tracking-widest mb-2">NETWORK POSITION</div>
                 <div className="flex items-center gap-3 text-xs text-aegis-text-secondary">
                  <span className="text-white font-medium">{supplier.primary_terminal}</span>
                  <ArrowRight size={12} className="text-aegis-text-muted" />
                  <span className="text-white font-medium">{supplier.primary_corridor}</span>
                  <ArrowRight size={12} className="text-aegis-text-muted" />
                  <span>Arabian Sea</span>
                  <ArrowRight size={12} className="text-aegis-text-muted" />
                  <span>Global Markets</span>
                 </div>
              </div>

              <div className="flex-1 w-full h-full">
                <GeographicMap 
                  facilities={facilities} 
                  corridors={corridors} 
                  supplyFlows={relatedFlows} 
                  highlightedNodeIds={[supplier.id, ...relatedFlows.map(f => f.corridor_id)]}
                />
              </div>
            </div>
            
            {/* Bottom charts row */}
            <div className="grid grid-cols-2 gap-4 h-[180px]">
               <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4 flex flex-col">
                  <div className="text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest mb-1">SUPPLY TREND <span className="text-aegis-text-secondary font-normal normal-case">(Last 7 Days)</span></div>
                  <div className="text-[10px] text-aegis-text-muted mb-2">bbl/d</div>
                  <div className="flex-1 flex items-end relative overflow-hidden">
                    {/* Dummy Chart */}
                    <div className="absolute inset-0 flex items-end pt-4">
                      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <path d="M0,30 L16,28 L33,28 L50,26 L66,25 L83,22 L100,10" fill="none" stroke="#2388FF" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                        <path d="M0,30 L16,28 L33,28 L50,26 L66,25 L83,22 L100,10 L100,40 L0,40 Z" fill="url(#blue-gradient)" opacity="0.2" />
                        <defs>
                          <linearGradient id="blue-gradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#2388FF" stopOpacity="1" />
                            <stop offset="100%" stopColor="#2388FF" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Data points */}
                        <circle cx="0" cy="30" r="2" fill="#2388FF" />
                        <circle cx="16" cy="28" r="2" fill="#2388FF" />
                        <circle cx="33" cy="28" r="2" fill="#2388FF" />
                        <circle cx="50" cy="26" r="2" fill="#2388FF" />
                        <circle cx="66" cy="25" r="2" fill="#2388FF" />
                        <circle cx="83" cy="22" r="2" fill="#2388FF" />
                        <circle cx="100" cy="10" r="2" fill="#2388FF" />
                      </svg>
                      <div className="absolute right-0 top-0 text-xs font-bold text-aegis-blue">{supplier.current_supply}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-aegis-text-muted mt-2">
                    <span>May 20</span><span>May 21</span><span>May 22</span><span>May 23</span><span>May 24</span><span>May 25</span><span>May 26</span>
                  </div>
               </div>
               
               <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4 flex flex-col">
                  <div className="text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest mb-4">SUPPLY COMPOSITION</div>
                  <div className="flex-1 flex items-center gap-6">
                    {/* Donut Chart placeholder */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#223252" strokeWidth="4" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2388FF" strokeWidth="4" strokeDasharray="100, 100" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-sm font-bold text-white">{supplier.current_supply}</div>
                        <div className="text-[7px] text-aegis-text-secondary">Total bbl/d</div>
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-aegis-blue"></div>
                          <span className="text-aegis-text-secondary text-[10px] truncate max-w-[80px]">{supplier.primary_terminal}</span>
                        </div>
                        <span className="text-white text-[10px]">{supplier.current_supply} (100%)</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest mb-3">SUMMARY</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-aegis-text-secondary">Country of Origin</span>
                  <span className="text-white font-medium">{supplier.country === 'IQ' ? 'Iraq' : supplier.country === 'SA' ? 'Saudi Arabia' : supplier.country}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-aegis-text-secondary">Supplier Type</span>
                  <span className="text-white font-medium">{supplier.supplier_type.charAt(0) + supplier.supplier_type.slice(1).toLowerCase()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-aegis-text-secondary">Status</span>
                  <span className="text-aegis-green font-medium">Operational</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-aegis-text-secondary">Primary Terminal</span>
                  <span className="text-white font-medium">{supplier.primary_terminal}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-aegis-text-secondary">Supply Reliability</span>
                  <span className="text-aegis-green font-medium">{supplier.supply_reliability}</span>
                </div>
              </div>
            </div>
            
            <div className="h-px w-full bg-aegis-border/50"></div>
            
            <div>
              <div className="text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest mb-3">PRIMARY CORRIDOR</div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-aegis-red/10 border border-aegis-red/20 flex items-center justify-center text-aegis-red">
                  {/* icon */}
                  <ShieldAlert size={12} />
                </div>
                <span className="text-sm font-bold text-white">{supplier.primary_corridor}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-aegis-text-secondary mb-1">Risk Score</div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-aegis-red">72</span><span className="text-xs text-aegis-text-muted mt-1">/100</span>
                    <span className="text-[8px] font-bold bg-aegis-red/20 text-aegis-red px-1 rounded border border-aegis-red/30">CRITICAL</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-aegis-text-secondary mb-1">Status</div>
                  <div className="text-sm text-aegis-red">Elevated Threat</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-[10px] text-aegis-text-secondary mb-1">Throughput</div>
                <div className="text-sm text-white">18.5M bbl/d</div>
              </div>
            </div>
            
            <div className="h-px w-full bg-aegis-border/50"></div>

            <div>
              <div className="text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest mb-3">RISK DRIVERS</div>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-aegis-red flex items-center justify-center text-[8px] text-white font-bold">!</div>
                    <span className="text-aegis-text-secondary">Geopolitical Instability</span>
                  </div>
                  <span className="text-aegis-red font-medium">High</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-aegis-orange flex items-center justify-center text-[8px] text-white font-bold">!</div>
                    <span className="text-aegis-text-secondary">{supplier.primary_corridor} Exposure</span>
                  </div>
                  <span className="text-aegis-orange font-medium">Elevated</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-aegis-yellow flex items-center justify-center text-[8px] text-black font-bold">!</div>
                    <span className="text-aegis-text-secondary">Infrastructure Vulnerability</span>
                  </div>
                  <span className="text-aegis-yellow font-medium">Moderate</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-aegis-green flex items-center justify-center text-[8px] text-black font-bold">✓</div>
                    <span className="text-aegis-text-secondary">Market Volatility</span>
                  </div>
                  <span className="text-aegis-green font-medium">Low</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
