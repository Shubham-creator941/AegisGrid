import { ChevronUp, ChevronDown, Clock, ShieldAlert } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function ContextSidebar() {
  const marketData = [
    { name: 'Brent Crude', price: '$85.24', change: 1.8, isUp: true },
    { name: 'WTI Crude', price: '$80.91', change: 1.2, isUp: true },
    { name: 'Henry Hub Gas', price: '$2.71', change: -0.6, isUp: false },
    { name: 'Diesel', price: '$4.48', change: 0.3, isUp: true },
  ];

  const riskData = [
    { name: 'Very High', value: 20, color: '#EF4444' },
    { name: 'High', value: 30, color: '#F97316' },
    { name: 'Moderate', value: 30, color: '#F59E0B' },
    { name: 'Low', value: 20, color: '#10B981' },
  ];

  const intelligenceFeed = [
    { time: '15:30 UTC', date: '26 May 2025', text: 'Heightened naval activity in the Persian Gulf.', source: 'Maritime Monitor' },
    { time: '14:15 UTC', date: '26 May 2025', text: 'Red Sea shipping rerouting continues.', source: 'Trade Monitor' }
  ];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      
      {/* Top Disruption Risk */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-4 flex flex-col shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-[#1E293B] pb-1">Top Disruption Risk</h3>
        
        <div className="flex justify-between items-start mb-2">
          <div className="font-semibold text-sm text-slate-200">Strait of Hormuz Blockade</div>
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30">CRITICAL</span>
        </div>
        
        <div className="flex justify-between items-end mt-2">
          <div>
            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-0.5">Risk Score</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-light text-[#EF4444] tracking-tight">72</span>
              <span className="text-xs text-slate-500 font-medium">/100</span>
            </div>
          </div>
          <div className="text-xs text-[#EF4444] font-medium flex flex-col items-end">
            <span>↑ 4 <span className="text-slate-500 font-normal">vs yesterday</span></span>
            <svg viewBox="0 0 50 15" className="w-12 h-4 mt-1 overflow-visible">
              <polyline points="0,15 10,12 20,15 30,8 40,10 50,2" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Market Snapshot */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-4 flex flex-col shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-[#1E293B] pb-1">Market Snapshot (USD)</h3>
        <div className="flex flex-col gap-2.5">
          {marketData.map(item => (
            <div key={item.name} className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-200">{item.price}</span>
                <span className={`flex items-center text-xs font-semibold w-12 justify-end ${item.isUp ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {item.isUp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {Math.abs(item.change)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supply Risk Breakdown */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-4 flex flex-col shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-[#1E293B] pb-1">Supply Risk Breakdown</h3>
        <div className="h-32 w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskData}
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#E2E8F0' }}
                formatter={(value: any) => [`${value}%`, 'Share']}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom Legend */}
          <div className="absolute right-0 top-0 h-full flex flex-col justify-center gap-2 text-[10px] font-medium text-slate-400">
            {riskData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span>{item.name} — {item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Network Status */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-4 flex flex-col shadow-sm">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-[#1E293B] pb-1">Network Status</h3>
        <div className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Geopolitical Risk</span>
            <span className="text-[#F97316] font-semibold">High</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Logistics Risk</span>
            <span className="text-[#F59E0B] font-semibold">Elevated</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Supply Risk</span>
            <span className="text-[#10B981] font-semibold">Moderate</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Market Risk</span>
            <span className="text-[#10B981] font-semibold">Normal</span>
          </div>
        </div>
      </div>

      {/* Latest Intelligence */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-4 flex flex-col flex-1 shadow-sm overflow-hidden">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-[#1E293B] pb-1 flex items-center gap-2">
          <ShieldAlert size={12} className="text-[#22D3EE]" />
          Latest Intelligence
        </h3>
        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          {intelligenceFeed.map((intel, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="mt-0.5 text-slate-600">
                <Clock size={14} />
              </div>
              <div className="flex flex-col">
                <div className="text-[10px] text-slate-500 font-mono tracking-tight mb-0.5">{intel.date}, {intel.time}</div>
                <div className="text-xs text-slate-300 leading-relaxed font-medium mb-1">{intel.text}</div>
                <div className="text-[10px] text-[#22D3EE]/80 uppercase tracking-widest">Source: {intel.source}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors text-left pt-2 border-t border-[#1E293B]">
          View All Intelligence &rarr;
        </button>
      </div>

    </div>
  );
}
