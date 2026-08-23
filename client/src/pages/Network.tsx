import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  MapPin, 
  Route, 
  AlertCircle,
  ChevronRight,
  Search,
  ShieldAlert
} from 'lucide-react';
import { useNetworkEntities } from '../features/network/hooks/useNetwork';
import { NetworkApi } from '../features/network/api/network.api';
import type { Supplier, Facility, Corridor, SupplyFlow } from '../features/network/api/network.api';
import { SupplierDetails } from '../features/network/components/SupplierDetails';
import { GeographicMap } from '../features/network/components/GeographicMap';
import { SimulateDisruptionDialog, type SimulationContext } from '../features/network/components/SimulateDisruptionDialog';
import { useEventsList } from '../features/events/hooks/useEvents';
import { overallTone, riskTone, statusTone, toneBadgeClass, toneDotClass, toneTextClass } from '../features/network/utils/networkSemantics';

type Tab = 'SUPPLIERS' | 'FACILITIES' | 'CORRIDORS';

export default function Network() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab | null) || 'SUPPLIERS';
  const initialEntityId = searchParams.get('entityId') || undefined;
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | undefined>(initialTab === 'SUPPLIERS' ? initialEntityId : undefined);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | undefined>(initialTab === 'FACILITIES' ? initialEntityId : undefined);
  const [selectedCorridorId, setSelectedCorridorId] = useState<string | undefined>(initialTab === 'CORRIDORS' ? initialEntityId : undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [simulationContext, setSimulationContext] = useState<SimulationContext | null>(null);
  
  // List fetchers
  const { data: suppliers, loading: sLoad, error: sErr } = useNetworkEntities<Supplier>(NetworkApi.getSuppliers);
  const { data: facilities, loading: fLoad, error: fErr } = useNetworkEntities<Facility>(NetworkApi.getFacilities);
  const { data: corridors, loading: cLoad, error: cErr } = useNetworkEntities<Corridor>(NetworkApi.getCorridors);
  const { data: supplyFlows } = useNetworkEntities<SupplyFlow>(NetworkApi.getSupplyFlows);
  const { data: events, loading: eventsLoading } = useEventsList();

  const normalize = (value?: string) => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const relatedEvent = simulationContext
    ? events.find(event => {
        const region = normalize(event.affected_region);
        const corridor = normalize(simulationContext.primaryCorridor);
        return Boolean(region && corridor && (region.includes(corridor) || corridor.includes(region)));
      }) || null
    : null;

  const riskLevel = (score?: number, status?: string) => {
    const tone = overallTone(status, score);
    if (tone === 'critical') return 'CRITICAL';
    if (tone === 'warning') return 'HIGH';
    return 'MODERATE';
  };

  const openSupplierSimulation = (supplier: Supplier) => setSimulationContext({
    entityType: 'supplier', entityId: supplier.id, entityName: supplier.name,
    currentSupply: supplier.current_supply ? `${supplier.current_supply} bbl/d` : undefined,
    primaryTerminal: supplier.primary_terminal, primaryCorridor: supplier.primary_corridor,
    riskScore: supplier.risk_score, riskLevel: riskLevel(supplier.risk_score, supplier.status),
    returnTo: `/app/network?tab=SUPPLIERS&entityId=${encodeURIComponent(supplier.id)}`,
  });

  const openFacilitySimulation = (facility: Facility) => {
    const flow = supplyFlows.find(item => item.origin_facility_id === facility.id || item.destination_facility_id === facility.id);
    const corridor = corridors.find(item => item.id === flow?.corridor_id);
    setSimulationContext({
      entityType: 'facility', entityId: facility.id, entityName: facility.name,
      currentSupply: facility.current_throughput, primaryTerminal: facility.name,
      primaryCorridor: corridor?.name, riskScore: facility.risk_score,
      riskLevel: riskLevel(facility.risk_score, facility.status),
      returnTo: `/app/network?tab=FACILITIES&entityId=${encodeURIComponent(facility.id)}`,
    });
  };

  const openCorridorSimulation = (corridor: Corridor) => setSimulationContext({
    entityType: 'corridor', entityId: corridor.id, entityName: corridor.name,
    currentSupply: corridor.current_throughput, primaryCorridor: corridor.name,
    riskScore: corridor.risk_score, riskLevel: riskLevel(corridor.risk_score, corridor.status),
    returnTo: `/app/network?tab=CORRIDORS&entityId=${encodeURIComponent(corridor.id)}`,
  });

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
      return <SupplierDetails supplier={selected} facilities={facilities} corridors={corridors} supplyFlows={supplyFlows} onSimulate={() => openSupplierSimulation(selected)} />;
    }

    if (activeTab === 'FACILITIES') {
      const selected = facilities.find(f => f.id === selectedFacilityId);
      if (!selected) return <div className="p-8 text-aegis-text-muted">Loading details...</div>;
      const relatedFlows = supplyFlows.filter(flow => flow.origin_facility_id === selected.id || flow.destination_facility_id === selected.id);
      const relatedCorridors = corridors.filter(corridor => relatedFlows.some(flow => flow.corridor_id === corridor.id));
      const connectedFacilityIds = relatedFlows.flatMap(flow => [flow.origin_facility_id, flow.destination_facility_id]);
      const highlightedIds = [selected.id, ...connectedFacilityIds, ...relatedCorridors.map(corridor => corridor.id)];
      const utilizedVolume = parseReportedVolume(selected.current_throughput) ?? relatedFlows.reduce((total, flow) => total + flow.baseline_volume, 0);
      const utilization = selected.capacity ? Math.min(100, Math.round((utilizedVolume / selected.capacity) * 100)) : 0;
      
      return (
        <div className="flex flex-col h-full bg-aegis-panel">
          <div className="p-6 border-b border-aegis-border flex flex-wrap justify-between items-start gap-4">
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
            <div className="flex w-full min-[1200px]:w-auto flex-wrap items-center gap-3">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${toneBadgeClass[statusTone(selected.status)]}`}><span className={`w-1.5 h-1.5 rounded-full ${toneDotClass[statusTone(selected.status)]}`}></span>{selected.status}</span>
              <button onClick={() => openFacilitySimulation(selected)} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-aegis-blue/50 px-3 py-2 text-sm font-medium text-aegis-blue hover:bg-aegis-blue/10 active:bg-aegis-blue/20"><ShieldAlert size={15} /> Simulate Disruption</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest mb-4">FACILITY METRICS</h3>
            <div className="grid grid-cols-1 min-[1200px]:grid-cols-3 gap-4 mb-8">
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
                 <div className={`text-lg font-bold ${toneTextClass[riskTone(selected.risk_score)]}`}>{selected.risk_score ?? '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 min-[1500px]:grid-cols-[1.7fr_1fr]">
              <div className="h-[360px] overflow-hidden rounded-xl border border-aegis-border bg-aegis-base">
                <div className="flex h-12 items-center justify-between border-b border-aegis-border px-4">
                  <div><div className="text-[10px] font-bold uppercase tracking-widest text-aegis-blue">Network Position</div><div className="mt-0.5 text-xs text-aegis-text-secondary">Connected routes through {selected.name}</div></div>
                  <span className="text-[10px] font-bold text-aegis-text-muted">{relatedFlows.length} ACTIVE FLOW{relatedFlows.length === 1 ? '' : 'S'}</span>
                </div>
                <div className="h-[calc(100%-48px)]"><GeographicMap facilities={facilities} corridors={corridors} supplyFlows={relatedFlows} highlightedNodeIds={highlightedIds} /></div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-aegis-border bg-aegis-base p-4">
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-aegis-text-muted">Operational Context</div>
                  <ContextRow label="Utilization" value={`${utilization}%`} tone={utilization > 85 ? 'risk' : 'normal'} />
                  <ContextRow label="Connected Corridors" value={String(relatedCorridors.length)} />
                  <ContextRow label="Region" value={selected.region} />
                  <ContextRow label="Facility Type" value={selected.facility_type.replaceAll('_', ' ')} last />
                </div>
                <div className="rounded-xl border border-aegis-border bg-aegis-base p-4">
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-aegis-text-muted">Connected Flows</div>
                  <div className="space-y-3">{relatedFlows.length ? relatedFlows.map(flow => {
                    const counterpartId = flow.origin_facility_id === selected.id ? flow.destination_facility_id : flow.origin_facility_id;
                    const counterpart = facilities.find(facility => facility.id === counterpartId);
                    const corridor = corridors.find(item => item.id === flow.corridor_id);
                    return <div key={flow.id} className="rounded-lg border border-aegis-border/60 bg-aegis-panel p-3"><div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-white">{counterpart?.name || 'Unknown facility'}</span><span className="text-aegis-green">{flow.status}</span></div><div className="mt-1 text-[10px] text-aegis-text-secondary">{corridor?.name || 'Corridor unavailable'} · {flow.commodity.replaceAll('_', ' ')}</div></div>;
                  }) : <div className="text-xs text-aegis-text-muted">No active flow is associated with this facility.</div>}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'CORRIDORS') {
      const selected = corridors.find(c => c.id === selectedCorridorId);
      if (!selected) return <div className="p-8 text-aegis-text-muted">Loading details...</div>;
      const relatedFlows = supplyFlows.filter(flow => flow.corridor_id === selected.id);
      const highlightedIds = [selected.id, ...relatedFlows.flatMap(flow => [flow.origin_facility_id, flow.destination_facility_id])];
      const baselineVolume = parseReportedVolume(selected.current_throughput) ?? relatedFlows.reduce((total, flow) => total + flow.baseline_volume, 0);
      const utilization = selected.capacity ? Math.min(100, Math.round((baselineVolume / selected.capacity) * 100)) : 0;
      
      return (
        <div className="flex flex-col h-full bg-aegis-panel">
          <div className="p-6 border-b border-aegis-border flex flex-wrap justify-between items-start gap-4">
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
            <div className="flex w-full min-[1200px]:w-auto flex-wrap items-center gap-3">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 ${toneBadgeClass[statusTone(selected.status)]}`}><span className={`w-1.5 h-1.5 rounded-full ${toneDotClass[statusTone(selected.status)]}`}></span>{selected.status}</span>
              <button onClick={() => openCorridorSimulation(selected)} className="flex items-center gap-2 rounded-[var(--radius-md)] border border-aegis-blue/50 px-3 py-2 text-sm font-medium text-aegis-blue hover:bg-aegis-blue/10 active:bg-aegis-blue/20"><ShieldAlert size={15} /> Simulate Disruption</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-[10px] font-bold text-aegis-text-muted uppercase tracking-widest mb-4">CORRIDOR METRICS</h3>
            <div className="grid grid-cols-1 min-[1200px]:grid-cols-3 gap-4 mb-8">
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
                 <div className={`text-lg font-bold ${toneTextClass[riskTone(selected.risk_score)]}`}>{selected.risk_score ?? '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 min-[1500px]:grid-cols-[1.7fr_1fr]">
              <div className="h-[360px] overflow-hidden rounded-xl border border-aegis-border bg-aegis-base">
                <div className="flex h-12 items-center justify-between border-b border-aegis-border px-4">
                  <div><div className="text-[10px] font-bold uppercase tracking-widest text-aegis-blue">Corridor Footprint</div><div className="mt-0.5 text-xs text-aegis-text-secondary">{selected.origin} → {selected.destination}</div></div>
                  <span className="text-[10px] font-bold text-aegis-text-muted">{relatedFlows.length} CONNECTED FLOW{relatedFlows.length === 1 ? '' : 'S'}</span>
                </div>
                <div className="h-[calc(100%-48px)]"><GeographicMap facilities={facilities} corridors={corridors} supplyFlows={relatedFlows} highlightedNodeIds={highlightedIds} /></div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-aegis-border bg-aegis-base p-4">
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-aegis-text-muted">Operational Context</div>
                  <ContextRow label="Utilized Capacity" value={`${utilization}%`} tone={utilization > 85 ? 'risk' : 'normal'} />
                  <ContextRow label="Corridor Type" value={selected.corridor_type.replaceAll('_', ' ')} />
                  <ContextRow label="Origin" value={selected.origin} />
                  <ContextRow label="Destination" value={selected.destination} last />
                </div>
                <div className="rounded-xl border border-aegis-border bg-aegis-base p-4">
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-aegis-text-muted">Affected Regions</div>
                  <div className="flex flex-wrap gap-2">{selected.affected_regions?.length ? selected.affected_regions.map(region => <span key={region} className="rounded-md border border-aegis-blue/30 bg-aegis-blue/10 px-2.5 py-1 text-xs text-aegis-blue">{region}</span>) : <span className="text-xs text-aegis-text-muted">No affected regions reported.</span>}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="h-full flex flex-col w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Network Intelligence</h1>
        <p className="text-sm text-aegis-text-secondary mt-1">Operational view of suppliers, facilities, and corridors.</p>
      </div>

      <div className="flex border-b border-aegis-border mb-6 gap-8">
        {(['SUPPLIERS', 'FACILITIES', 'CORRIDORS'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
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

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col min-[1200px]:flex-row gap-4 xl:gap-6">
        
        {/* Left Column (List) */}
        <div className="w-full min-[1200px]:w-[35%] min-h-[260px] max-h-[320px] min-[1200px]:max-h-none bg-aegis-panel border border-aegis-border rounded-xl flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-aegis-border bg-aegis-panel">
            <div className="relative">
              <input 
                type="text" 
                placeholder={`Filter ${activeTab.toLowerCase()}...`}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full bg-aegis-base border border-aegis-border rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-aegis-blue placeholder-aegis-text-muted transition-colors"
              />
              <Search size={16} className="absolute left-3 top-2.5 text-aegis-text-muted" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'SUPPLIERS' && (
              renderListState(sLoad, sErr, suppliers, 'SUPPLIERS') || 
              suppliers.filter(s => `${s.name} ${s.country}`.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
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
                        <span className={`w-1.5 h-1.5 rounded-full ${toneDotClass[overallTone(s.status, s.risk_score)]}`}></span>
                        <span className="text-[10px] text-aegis-text-muted">{s.status}</span>
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
              facilities.filter(f => `${f.name} ${f.region} ${f.facility_type}`.toLowerCase().includes(searchQuery.toLowerCase())).map(f => (
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
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDotClass[overallTone(f.status, f.risk_score)]}`}></span>
                    </div>
                    <span className="text-xs text-aegis-text-secondary mt-1">{f.facility_type.replace('_', ' ')} &middot; {f.region}</span>
                  </div>
                  {selectedFacilityId === f.id && <ChevronRight size={16} className="text-aegis-blue" />}
                </button>
              ))
            )}

            {activeTab === 'CORRIDORS' && (
              renderListState(cLoad, cErr, corridors, 'CORRIDORS') || 
              corridors.filter(c => `${c.name} ${c.direction || ''}`.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
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
                      <span className={`w-1.5 h-1.5 rounded-full ${toneDotClass[overallTone(c.status, c.risk_score)]}`}></span>
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
        <div className="flex-1 min-h-[560px] bg-aegis-panel border border-aegis-border rounded-xl overflow-hidden shadow-lg">
          {renderDetailPanel()}
        </div>

      </div>

      <SimulateDisruptionDialog
        key={simulationContext?.entityId || 'closed'}
        open={Boolean(simulationContext)}
        context={simulationContext}
        relatedEvent={relatedEvent}
        eventsLoading={eventsLoading}
        onClose={() => setSimulationContext(null)}
      />
    </div>
  );
}

function ContextRow({ label, value, tone, last = false }: { label: string; value: string; tone?: 'risk' | 'normal'; last?: boolean }) {
  return <div className={`flex min-h-9 items-center justify-between gap-4 text-xs ${last ? '' : 'border-b border-aegis-border/50'}`}><span className="text-aegis-text-secondary">{label}</span><span className={`max-w-[60%] text-right font-semibold uppercase ${tone === 'risk' ? 'text-aegis-red' : tone === 'normal' ? 'text-aegis-green' : 'text-white'}`}>{value}</span></div>;
}

function parseReportedVolume(value?: string) {
  if (!value) return null;
  const amount = Number.parseFloat(value);
  if (!Number.isFinite(amount)) return null;
  return value.toUpperCase().includes('M') ? amount * 1_000_000 : amount;
}
