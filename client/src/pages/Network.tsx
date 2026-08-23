import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Route, 
  AlertCircle,
  Activity,
  ShieldAlert,
  ChevronRight,
  Search
} from 'lucide-react';
import { useNetworkEntities, useEntityDetail } from '../features/network/hooks/useNetwork';
import { NetworkApi } from '../features/network/api/network.api';
import type { Supplier, Facility, Corridor, SupplyFlow } from '../features/network/api/network.api';
import { SupplierDetails } from '../features/network/components/SupplierDetails';

type Tab = 'SUPPLIERS' | 'FACILITIES' | 'CORRIDORS';

export default function Network() {
  const [activeTab, setActiveTab] = useState<Tab>('SUPPLIERS');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | undefined>();
  const [selectedCorridorId, setSelectedCorridorId] = useState<string | undefined>();
  
  // List fetchers
  const { data: suppliers, loading: sLoad, error: sErr } = useNetworkEntities<Supplier>(NetworkApi.getSuppliers);
  const { data: facilities, loading: fLoad, error: fErr } = useNetworkEntities<Facility>(NetworkApi.getFacilities);
  const { data: corridors, loading: cLoad, error: cErr } = useNetworkEntities<Corridor>(NetworkApi.getCorridors);
  const { data: supplyFlows } = useNetworkEntities<SupplyFlow>(NetworkApi.getSupplyFlows);

  // Set default selection when data loads
  useEffect(() => {
    if (suppliers.length > 0 && !selectedSupplierId) {
      // Default to Iraq if present, otherwise first item
      const iraq = suppliers.find(s => s.country === 'IQ');
      setSelectedSupplierId(iraq ? iraq.id : suppliers[0].id);
    }
  }, [suppliers, selectedSupplierId]);

  useEffect(() => {
    if (facilities.length > 0 && !selectedFacilityId) {
      setSelectedFacilityId(facilities[0].id);
    }
  }, [facilities, selectedFacilityId]);

  useEffect(() => {
    if (corridors.length > 0 && !selectedCorridorId) {
      const hormuz = corridors.find(c => c.name.includes('Hormuz'));
      setSelectedCorridorId(hormuz ? hormuz.id : corridors[0].id);
    }
  }, [corridors, selectedCorridorId]);

  const renderListState = (loading: boolean, error: string | null, items: any[], type: Tab) => {
    if (loading) {
      return (
        <div className="flex flex-col gap-2 p-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-aegis-base animate-pulse rounded border border-aegis-border"></div>
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-4 text-sm text-aegis-red flex items-center gap-2">
          <AlertCircle size={16} />
          Failed to load {type.toLowerCase()}
        </div>
      );
    }
    if (!items.length) {
      return (
        <div className="p-8 text-center text-sm text-aegis-text-muted">
          No {type.toLowerCase()} found.
        </div>
      );
    }
    return null;
  };

  const renderDetailPanel = () => {
    if (activeTab === 'SUPPLIERS') {
      const selected = suppliers.find(s => s.id === selectedSupplierId);
      if (!selected) return <div className="p-8 text-aegis-text-muted">Loading details...</div>;
      return <SupplierDetails supplier={selected} facilities={facilities} corridors={corridors} supplyFlows={supplyFlows} />;
    }

    if (activeTab === 'FACILITIES') {
      const selected = facilities.find(f => f.id === selectedFacilityId);
      if (!selected) return <div className="p-8 text-aegis-text-muted">Loading details...</div>;
      
      return (
        <div className="flex flex-col h-full bg-aegis-panel">
          <div className="p-6 border-b border-aegis-border flex justify-between items-start">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-aegis-blue/20 flex items-center justify-center border-2 border-aegis-blue/40 text-aegis-blue">
                 <MapPin size={18} />
               </div>
               <div>
                  <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-0.5">FACILITY</div>
                  <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                  <div className="text-aegis-text-secondary text-xs mt-1">{selected.region} • {selected.facility_type.replace('_', ' ')}</div>
               </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-aegis-green/20 text-aegis-green border border-aegis-green/30 uppercase flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-aegis-green"></span>
               {selected.status}
            </span>
          </div>
          <div className="p-6">
            <h3 className="text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest mb-4">FACILITY METRICS</h3>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4">
                 <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-2">CAPACITY</div>
                 <div className="text-lg font-bold text-white">{(selected.capacity / 1000000).toFixed(2)}M <span className="text-xs font-normal text-aegis-text-secondary">bbl/d</span></div>
              </div>
              <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4">
                 <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-2">THROUGHPUT</div>
                 <div className="text-lg font-bold text-white">{selected.current_throughput || '0.00M bbl/d'}</div>
              </div>
              <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4">
                 <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-2">RISK SCORE</div>
                 <div className={`text-lg font-bold ${(selected.risk_score || 0) > 50 ? 'text-aegis-red' : 'text-aegis-green'}`}>{selected.risk_score || 0}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'CORRIDORS') {
      const selected = corridors.find(c => c.id === selectedCorridorId);
      if (!selected) return <div className="p-8 text-aegis-text-muted">Loading details...</div>;
      
      return (
        <div className="flex flex-col h-full bg-aegis-panel">
          <div className="p-6 border-b border-aegis-border flex justify-between items-start">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-aegis-red/20 flex items-center justify-center border-2 border-aegis-red/40 text-aegis-red">
                 <Route size={18} />
               </div>
               <div>
                  <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-0.5">CORRIDOR</div>
                  <h2 className="text-xl font-bold text-white">{selected.name}</h2>
                  <div className="text-aegis-text-secondary text-xs mt-1">{selected.direction}</div>
               </div>
            </div>
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${selected.status === 'CRITICAL' ? 'bg-aegis-red/20 text-aegis-red border border-aegis-red/30' : 'bg-aegis-green/20 text-aegis-green border border-aegis-green/30'}`}>
               <span className={`w-1.5 h-1.5 rounded-full ${selected.status === 'CRITICAL' ? 'bg-aegis-red' : 'bg-aegis-green'}`}></span>
               {selected.status}
            </span>
          </div>
          <div className="p-6">
            <h3 className="text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest mb-4">CORRIDOR METRICS</h3>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4">
                 <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-2">MAX CAPACITY</div>
                 <div className="text-lg font-bold text-white">{(selected.capacity / 1000000).toFixed(2)}M <span className="text-xs font-normal text-aegis-text-secondary">bbl/d</span></div>
              </div>
              <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4">
                 <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-2">THROUGHPUT</div>
                 <div className="text-lg font-bold text-white">{selected.current_throughput || '0.00M bbl/d'}</div>
              </div>
              <div className="bg-aegis-base border border-aegis-border/60 rounded-xl p-4">
                 <div className="text-[10px] text-aegis-text-muted uppercase tracking-widest mb-2">RISK SCORE</div>
                 <div className={`text-lg font-bold ${(selected.risk_score || 0) > 60 ? 'text-aegis-red' : 'text-aegis-yellow'}`}>{selected.risk_score || 0}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col w-full max-w-7xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Network Intelligence</h1>
        <p className="text-sm text-aegis-text-secondary mt-1">Operational view of suppliers, facilities, and corridors.</p>
      </div>

      <div className="flex border-b border-aegis-border mb-6 gap-8">
        {(['SUPPLIERS', 'FACILITIES', 'CORRIDORS'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold tracking-wide transition-colors relative ${
              activeTab === tab 
                ? 'text-aegis-blue' 
                : 'text-aegis-text-muted hover:text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-aegis-blue shadow-[0_0_8px_rgba(35,136,255,0.8)]"></div>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex gap-6">
        
        {/* Left Column (List) */}
        <div className="w-[35%] bg-aegis-panel border border-aegis-border rounded-xl flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-aegis-border bg-aegis-panel">
            <div className="relative">
              <input 
                type="text" 
                placeholder={`Filter ${activeTab.toLowerCase()}...`}
                className="w-full bg-aegis-base border border-aegis-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-aegis-blue placeholder-aegis-text-muted transition-colors"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-aegis-text-muted" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'SUPPLIERS' && (
              renderListState(sLoad, sErr, suppliers, 'SUPPLIERS') || 
              suppliers.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSupplierId(s.id)}
                  className={`w-full text-left p-4 border-b border-aegis-border transition-colors flex items-center justify-between ${
                    selectedSupplierId === s.id ? 'bg-aegis-blue/10 border-l-[3px] border-l-aegis-blue' : 'hover:bg-aegis-base border-l-[3px] border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-aegis-border/50">
                      <div className="text-[8px] font-bold text-slate-800">{s.country}</div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{s.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'ACTIVE' ? 'bg-aegis-green shadow-[0_0_5px_rgba(22,217,120,0.5)]' : 'bg-aegis-yellow'}`}></span>
                        <span className="text-[10px] text-aegis-text-muted">Operational</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-aegis-text-secondary">{s.country} • Sovereign</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs font-bold text-white">{s.current_supply}</span>
                        <span className="text-[10px] text-aegis-text-secondary">{s.supply_share} share</span>
                      </div>
                    </div>
                  </div>
                  {selectedSupplierId === s.id && <ChevronRight size={16} className="text-aegis-blue" />}
                </button>
              ))
            )}

            {activeTab === 'FACILITIES' && (
              renderListState(fLoad, fErr, facilities, 'FACILITIES') || 
              facilities.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFacilityId(f.id)}
                  className={`w-full text-left p-4 border-b border-aegis-border transition-colors flex items-center justify-between ${
                    selectedFacilityId === f.id ? 'bg-aegis-blue/10 border-l-[3px] border-l-aegis-blue' : 'hover:bg-aegis-base border-l-[3px] border-l-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{f.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full bg-aegis-green shadow-[0_0_5px_rgba(22,217,120,0.5)]`}></span>
                    </div>
                    <span className="text-xs text-aegis-text-secondary mt-1">{f.facility_type.replace('_', ' ')} &middot; {f.region}</span>
                  </div>
                  {selectedFacilityId === f.id && <ChevronRight size={16} className="text-aegis-blue" />}
                </button>
              ))
            )}

            {activeTab === 'CORRIDORS' && (
              renderListState(cLoad, cErr, corridors, 'CORRIDORS') || 
              corridors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCorridorId(c.id)}
                  className={`w-full text-left p-4 border-b border-aegis-border transition-colors flex items-center justify-between ${
                    selectedCorridorId === c.id ? 'bg-aegis-blue/10 border-l-[3px] border-l-aegis-blue' : 'hover:bg-aegis-base border-l-[3px] border-l-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{c.name}</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'CRITICAL' ? 'bg-aegis-red shadow-[0_0_5px_rgba(255,65,77,0.5)]' : 'bg-aegis-green shadow-[0_0_5px_rgba(22,217,120,0.5)]'}`}></span>
                    </div>
                    <span className="text-xs text-aegis-text-secondary mt-1">{c.direction}</span>
                  </div>
                  {selectedCorridorId === c.id && <ChevronRight size={16} className="text-aegis-blue" />}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Column (Detail) */}
        <div className="flex-1 bg-aegis-panel border border-aegis-border rounded-xl overflow-hidden shadow-lg">
          {renderDetailPanel()}
        </div>

      </div>
    </div>
  );
}
