import { Activity, Anchor, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Supplier, Facility, Corridor, SupplyFlow } from '../api/network.api';

interface NetworkTopologyProps {
  suppliers: Supplier[];
  facilities: Facility[];
  corridors: Corridor[];
  supplyFlows?: SupplyFlow[];
  loading?: boolean;
}

export function NetworkTopology({ suppliers, facilities, loading }: NetworkTopologyProps) {
  
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center border border-[#1E293B] bg-[#0B1120] rounded-xl">
        <div className="flex flex-col items-center text-slate-500">
          <Activity className="animate-spin mb-2" size={24} />
          <span className="text-xs uppercase tracking-wider font-semibold">Mapping Topology...</span>
        </div>
      </div>
    );
  }

  if (!suppliers.length && !facilities.length) {
    return (
      <div className="w-full h-full flex items-center justify-center border border-[#1E293B] bg-[#0B1120] rounded-xl">
        <div className="flex flex-col items-center text-slate-600">
          <Anchor className="mb-2 opacity-50" size={24} />
          <span className="text-xs uppercase tracking-wider">No topology data</span>
        </div>
      </div>
    );
  }



  // Hardcoded for demo to match the visual reference exactly
  const demoSuppliers = [
    { id: 'sa', name: 'Saudi Arabia', classification: 'SOVEREIGN · SA', share: '3.45M share', status: 'ACTIVE' },
    { id: 'iq', name: 'Iraq', classification: 'SOVEREIGN · IQ', share: '1.18M share', status: 'ACTIVE' },
    { id: 'ae', name: 'UAE', classification: 'SOVEREIGN · AE', share: '13% share', status: 'ACTIVE' },
    { id: 'ru', name: 'Russia', classification: 'SOVEREIGN · RU', share: '10% share', status: 'ACTIVE' },
    { id: 'other', name: 'Other', classification: 'DIVERSE', share: '4% share', status: 'ACTIVE' }
  ];

  const demoOrigins = [
    { id: 'o1', name: 'Ras Tanura Terminal', region: 'Gulf', status: 'ACTIVE' },
    { id: 'o2', name: 'Basrah Oil Terminal', region: 'Gulf', status: 'ACTIVE' },
    { id: 'o3', name: 'Fujairah / Jebel Dhanna', region: 'Gulf', status: 'ACTIVE' },
    { id: 'o4', name: 'Novorossiysk Terminal', region: 'Black Sea', status: 'ACTIVE' }
  ];

  const demoCorridors = [
    { id: 'c1', name: 'Strait of Hormuz', route: 'Gulf → Arabian Sea', status: 'CRITICAL', label: 'HIGH RISK' },
    { id: 'c2', name: 'Red Sea / Bab-el-Mandeb', route: 'Red Sea → Arabian Sea', status: 'DISRUPTED', label: 'ELEVATED' },
    { id: 'c3', name: 'Saudi Petroleum (East-West)', route: 'East Province → Red Sea', status: 'ACTIVE', label: 'NORMAL' }
  ];

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle size={14} className="text-[#10B981]" />;
      case 'MAINTENANCE':
      case 'DISRUPTED': return <AlertTriangle size={14} className="text-[#F59E0B]" />;
      case 'CRITICAL': return <AlertTriangle size={14} className="text-[#EF4444]" />;
      case 'INACTIVE': return <XCircle size={14} className="text-slate-500" />;
      default: return <div className="w-3.5 h-3.5 rounded-full bg-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CRITICAL': return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
      case 'DISRUPTED': return 'text-[#F97316] bg-[#F97316]/10 border-[#F97316]/30';
      case 'MAINTENANCE': return 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30';
      case 'ACTIVE': return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="w-full h-full bg-[#0B1120] border border-[#1E293B] rounded-xl flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#1E293B] bg-[#0F172A]/50">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="text-[#22D3EE]" />
          Network Topology
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* SUPPLIERS */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-[#1E293B] pb-1">Suppliers</h3>
          <div className="space-y-2">
            {demoSuppliers.map(s => (
              <div key={s.id} className="bg-[#0F172A] border border-[#1E293B] hover:border-[#334155] rounded-lg p-3 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-slate-200">{s.name}</span>
                  {renderStatusIcon(s.status)}
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-mono tracking-tight">{s.classification}</span>
                  <span className="text-[#22D3EE] font-medium">{s.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ORIGIN TERMINALS */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-[#1E293B] pb-1">Origin Terminals</h3>
          <div className="space-y-2">
            {demoOrigins.map(o => (
              <div key={o.id} className="flex justify-between items-center bg-[#0F172A] border border-[#1E293B] rounded-lg p-3">
                <div>
                  <div className="font-semibold text-sm text-slate-200">{o.name}</div>
                  <div className="text-xs text-slate-500">{o.region}</div>
                </div>
                {renderStatusIcon(o.status)}
              </div>
            ))}
          </div>
        </div>

        {/* MARITIME CORRIDORS */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-[#1E293B] pb-1">Maritime Corridors</h3>
          <div className="space-y-2">
            {demoCorridors.map(c => (
              <div key={c.id} className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-sm text-slate-200">{c.name}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getStatusColor(c.status)}`}>
                    {c.label}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  {c.route}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
