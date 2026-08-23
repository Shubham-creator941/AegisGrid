import { Ship } from 'lucide-react';

export function ArrivalsTable() {
  const arrivals = [
    { vessel: 'AL KHAFJI', route: 'Ras Tanura → Rotterdam', cargo: '2.1M bbl', eta: '27 May, 03:00', status: 'On Time' },
    { vessel: 'GULF STAR', route: 'Basrah → Fujairah', cargo: '1.8M bbl', eta: '27 May, 11:45', status: 'On Time' },
    { vessel: 'CASPIAN WIND', route: 'Novorossiysk → Singapore', cargo: '1.5M bbl', eta: '28 May, 02:10', status: 'Delayed' },
    { vessel: 'RED SEA TRADER', route: 'Fujairah → Rotterdam', cargo: '2.0M bbl', eta: '28 May, 08:30', status: 'On Time' }
  ];

  return (
    <div className="w-full h-full bg-[#0B1120] border border-[#1E293B] rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="px-4 py-3 border-b border-[#1E293B] bg-[#0F172A]/50 flex justify-between items-center">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Ship size={14} className="text-[#22D3EE]" />
          Scheduled Arrivals <span className="text-slate-500 font-medium ml-1 capitalize tracking-normal">Next 72 Hours</span>
        </h3>
        <button className="text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors">
          View All &rarr;
        </button>
      </div>
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B] text-[10px] uppercase tracking-widest text-slate-500 bg-[#0F172A]">
              <th className="px-4 py-3 font-semibold">Vessel</th>
              <th className="px-4 py-3 font-semibold">Route</th>
              <th className="px-4 py-3 font-semibold">Cargo</th>
              <th className="px-4 py-3 font-semibold">ETA</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {arrivals.map((row, idx) => (
              <tr key={idx} className="border-b border-[#1E293B]/50 hover:bg-[#1E293B]/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-slate-200">{row.vessel}</td>
                <td className="px-4 py-3 text-slate-400">{row.route}</td>
                <td className="px-4 py-3 text-slate-300 font-mono tracking-tight">{row.cargo}</td>
                <td className="px-4 py-3 text-slate-400 font-mono tracking-tight">{row.eta}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    row.status === 'On Time' 
                      ? 'text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30' 
                      : 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30'
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
