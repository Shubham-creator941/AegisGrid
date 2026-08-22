import { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Route, 
  AlertCircle,
  Activity,
  ShieldAlert,
  ChevronRight,
  Box
} from 'lucide-react';
import { useNetworkEntities, useEntityDetail } from '../features/network/hooks/useNetwork';
import { NetworkApi } from '../features/network/api/network.api';
import type { Supplier, Facility, Corridor } from '../features/network/api/network.api';

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

  // Detail fetchers
  const { data: supplierDetail, loading: sDetLoad } = useEntityDetail<Supplier>(
    activeTab === 'SUPPLIERS' ? selectedSupplierId : undefined, 
    NetworkApi.getSupplier
  );
  
  const { data: facilityDetail, loading: fDetLoad } = useEntityDetail<Facility>(
    activeTab === 'FACILITIES' ? selectedFacilityId : undefined, 
    NetworkApi.getFacility
  );

  const { data: corridorDetail, loading: cDetLoad } = useEntityDetail<Corridor>(
    activeTab === 'CORRIDORS' ? selectedCorridorId : undefined, 
    NetworkApi.getCorridor
  );

  
  const renderListState = (loading: boolean, error: string | null, items: any[], type: Tab) => {
    if (loading) {
      return (
        <div className="flex flex-col gap-2 p-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-slate-800 animate-pulse rounded border border-slate-700"></div>
          ))}
        </div>
      );
    }
    if (error) {
      return (
        <div className="p-4 text-sm text-red-400 flex items-center gap-2">
          <AlertCircle size={16} />
          Failed to load {type.toLowerCase()}
        </div>
      );
    }
    if (!items.length) {
      return (
        <div className="p-8 text-center text-sm text-slate-500">
          No {type.toLowerCase()} found.
        </div>
      );
    }
    return null;
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-900/40 text-emerald-400 border border-emerald-800/50">ACTIVE</span>;
      case 'MAINTENANCE':
      case 'DISRUPTED': return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-900/40 text-amber-400 border border-amber-800/50">{status}</span>;
      default: return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">{status}</span>;
    }
  };

  const renderDetailPanel = () => {
    if (activeTab === 'SUPPLIERS' && selectedSupplierId) {
      if (sDetLoad) return <div className="p-8 text-slate-500 flex items-center justify-center h-full"><Activity className="animate-spin" /></div>;
      if (!supplierDetail) return <div className="p-8 text-slate-500">Select a supplier to view details.</div>;
      
      return (
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Building2 size={12}/> SUPPLIER</div>
              <h2 className="text-xl font-semibold text-slate-100">{supplierDetail.name}</h2>
              <div className="mt-2">{renderStatus(supplierDetail.status)}</div>
            </div>
            <button disabled className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2" title="Scenario analysis offline">
              <ShieldAlert size={16} />
              Simulate Disruption
            </button>
          </div>
          
          <div className="p-6 flex flex-col gap-6 overflow-y-auto">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Country of Origin</div>
                  <div className="text-sm text-slate-200">{supplierDetail.country}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Supplier Type</div>
                  <div className="text-sm text-slate-200">{supplierDetail.supplier_type}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Network Context</h3>
              <div className="bg-slate-800/20 border border-slate-800 rounded p-4 text-sm text-slate-500 italic">
                Cross-referencing network flows... no data available.
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'FACILITIES' && selectedFacilityId) {
      if (fDetLoad) return <div className="p-8 text-slate-500 flex items-center justify-center h-full"><Activity className="animate-spin" /></div>;
      if (!facilityDetail) return <div className="p-8 text-slate-500">Select a facility to view details.</div>;
      
      return (
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><MapPin size={12}/> FACILITY</div>
              <h2 className="text-xl font-semibold text-slate-100">{facilityDetail.name}</h2>
              <div className="mt-2">{renderStatus(facilityDetail.status)}</div>
            </div>
            <button disabled className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2" title="Scenario analysis offline">
              <ShieldAlert size={16} />
              Simulate Disruption
            </button>
          </div>
          
          <div className="p-6 flex flex-col gap-6 overflow-y-auto">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Region & Country</div>
                  <div className="text-sm text-slate-200">{facilityDetail.region}, {facilityDetail.country}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Facility Type</div>
                  <div className="text-sm text-slate-200">{facilityDetail.facility_type}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Capacity</div>
                  <div className="text-sm text-slate-200">{facilityDetail.capacity} MT/day</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'CORRIDORS' && selectedCorridorId) {
      if (cDetLoad) return <div className="p-8 text-slate-500 flex items-center justify-center h-full"><Activity className="animate-spin" /></div>;
      if (!corridorDetail) return <div className="p-8 text-slate-500">Select a corridor to view details.</div>;
      
      return (
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Route size={12}/> MARITIME CORRIDOR</div>
              <h2 className="text-xl font-semibold text-slate-100">{corridorDetail.name}</h2>
              <div className="mt-2">{renderStatus(corridorDetail.status)}</div>
            </div>
            <button disabled className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2" title="Scenario analysis offline">
              <ShieldAlert size={16} />
              Simulate Disruption
            </button>
          </div>
          
          <div className="p-6 flex flex-col gap-6 overflow-y-auto">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Route Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Origin</div>
                  <div className="text-sm text-slate-200">{corridorDetail.origin}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Destination</div>
                  <div className="text-sm text-slate-200">{corridorDetail.destination}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Corridor Type</div>
                  <div className="text-sm text-slate-200">{corridorDetail.corridor_type}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Flow Capacity</div>
                  <div className="text-sm text-slate-200">{corridorDetail.capacity}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Risk & Exposure</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Historical Reliability</div>
                  <div className="text-sm text-slate-600 italic">Not available</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded p-3">
                  <div className="text-xs text-slate-500 mb-1">Geopolitical Risk Score</div>
                  <div className="text-sm text-slate-600 italic">Not available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Box size={48} className="mb-4 opacity-50" />
        <p>Select a {activeTab.toLowerCase().slice(0, -1)} from the list to view operational context.</p>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col w-full">
      <div className="mb-6 px-4 pt-2">
        <h1 className="text-xl font-semibold text-slate-200">Network Intelligence</h1>
        <p className="text-sm text-slate-500 mt-1">Operational view of suppliers, facilities, and corridors.</p>
      </div>

      <div className="flex border-b border-slate-800 mb-4 px-4 gap-6">
        {(['SUPPLIERS', 'FACILITIES', 'CORRIDORS'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 pb-6">
        
        {/* Master List Column */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-slate-800/30">
            <input 
              type="text" 
              placeholder={`Filter ${activeTab.toLowerCase()}...`}
              disabled
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-slate-500 disabled:opacity-50"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'SUPPLIERS' && (
              renderListState(sLoad, sErr, suppliers, 'SUPPLIERS') || 
              suppliers.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSupplierId(s.id)}
                  className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors flex items-center justify-between ${
                    selectedSupplierId === s.id ? 'bg-slate-800/80 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200">{s.name}</span>
                    <span className="text-xs text-slate-500 mt-1">{s.country}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              ))
            )}

            {activeTab === 'FACILITIES' && (
              renderListState(fLoad, fErr, facilities, 'FACILITIES') || 
              facilities.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFacilityId(f.id)}
                  className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors flex items-center justify-between ${
                    selectedFacilityId === f.id ? 'bg-slate-800/80 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200">{f.name}</span>
                    <span className="text-xs text-slate-500 mt-1">{f.facility_type} &middot; {f.region}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              ))
            )}

            {activeTab === 'CORRIDORS' && (
              renderListState(cLoad, cErr, corridors, 'CORRIDORS') || 
              corridors.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCorridorId(c.id)}
                  className={`w-full text-left p-4 border-b border-slate-800 hover:bg-slate-800/50 transition-colors flex items-center justify-between ${
                    selectedCorridorId === c.id ? 'bg-slate-800/80 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-200">{c.name}</span>
                    <span className="text-xs text-slate-500 mt-1">{c.origin} &rarr; {c.destination}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden relative">
          {renderDetailPanel()}
        </div>

      </div>
    </div>
  );
}
