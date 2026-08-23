import { Ship } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ArrivalsTable() {
  const arrivals = [
    { vessel: 'AL KHAFJI', route: 'Ras Tanura → Rotterdam', cargo: '2.1M bbl', eta: '27 May, 03:00', status: 'On Time' },
    { vessel: 'GULF STAR', route: 'Basrah → Fujairah', cargo: '1.8M bbl', eta: '27 May, 11:45', status: 'On Time' },
    { vessel: 'CASPIAN WIND', route: 'Novorossiysk → Singapore', cargo: '1.5M bbl', eta: '28 May, 02:10', status: 'Delayed' },
    { vessel: 'RED SEA TRADER', route: 'Fujairah → Rotterdam', cargo: '2.0M bbl', eta: '28 May, 08:30', status: 'On Time' }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="px-4 py-3 border-b border-[#1E293B] bg-[#0F172A]/50 shrink-0 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Ship size={14} className="text-[#22D3EE]" />
          Scheduled Arrivals <span className="text-slate-500 font-medium ml-1 capitalize tracking-normal">Next 72 Hours</span>
        </h3>
        <Link to="/app/network" className="text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-900 uppercase tracking-widest transition-colors shrink-0 rounded-[var(--radius-sm)] px-1.5 py-1">
          View All &rarr;
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[400px]">
          <thead className="sticky top-0 bg-[#0F172A] z-10 shadow-sm">
            <tr className="border-b border-[#1E293B] text-[10px] uppercase tracking-widest text-slate-500">
              <th className="px-4 py-3 font-semibold">Vessel</th>
              <th className="px-4 py-3 font-semibold">Route</th>
              <th className="px-4 py-3 font-semibold">Cargo</th>
              <th className="px-4 py-3 font-semibold">ETA</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {arrivals.map((row, idx) => (
              <tr key={idx} className="border-b border-[#1E293B]/50">
                <td className="px-4 py-3 font-semibold text-slate-200">{row.vessel}</td>
                <td className="px-4 py-3 text-slate-400">{row.route}</td>
                <td className="px-4 py-3 text-slate-300 font-mono tracking-tight">{row.cargo}</td>
                <td className="px-4 py-3 text-slate-400 font-mono tracking-tight">{row.eta}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                    row.status === 'On Time' 
                      ? 'text-status-normal bg-status-normal/10 border border-status-normal/30' 
                      : 'text-status-warning bg-status-warning/10 border border-status-warning/30'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
