import { Activity } from 'lucide-react';

export function KpiCards({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#0B1120] border border-[#1E293B] rounded-xl p-5 animate-pulse h-32">
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-800 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Pure SVG Sparkline component
  const Sparkline = ({ color, data, type = 'line' }: { color: string, data: number[], type?: 'line' | 'bar' }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    if (type === 'bar') {
      return (
        <svg viewBox="0 0 100 30" className="w-full h-8 overflow-visible">
          {data.map((val, i) => {
            const h = ((val - min) / range) * 25 + 5;
            const x = (i / (data.length - 1)) * 95;
            return <rect key={i} x={x} y={30 - h} width="4" height={h} fill={color} opacity={0.8} rx="1" />;
          })}
        </svg>
      );
    }
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - (((val - min) / range) * 25 + 5);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 30" className="w-full h-8 overflow-visible">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  // Pure SVG Gauge component
  const Gauge = ({ value, label, color }: { value: number, label: string, color: string }) => {
    const percent = value / 100;
    const angle = percent * 180 - 90;

    return (
      <div className="relative w-full h-16 flex items-center justify-center">
        <svg viewBox="0 0 120 70" className="w-full h-full overflow-visible">
          {/* Background Track */}
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#1E293B" strokeWidth="8" strokeLinecap="round" />
          {/* Active Track */}
          <path 
            d="M 10 60 A 50 50 0 0 1 110 60" 
            fill="none" 
            stroke={color} 
            strokeWidth="8" 
            strokeLinecap="round" 
            strokeDasharray="157" 
            strokeDashoffset={157 - (157 * percent)} 
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
          {/* Needle Center */}
          <circle cx="60" cy="60" r="4" fill="#64748B" />
          {/* Needle */}
          <line 
            x1="60" y1="60" 
            x2="60" y2="25" 
            stroke="#94A3B8" 
            strokeWidth="2" 
            strokeLinecap="round" 
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: '60px 60px', transition: 'transform 1s ease-out' }}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center font-bold text-sm" style={{ color }}>
          {value} <span className="text-slate-400 font-medium text-xs ml-0.5">{label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      
      {/* CARD 1: VOLUME */}
      <div className="bg-[#0B1120] border border-[#1E293B] hover:border-[#334155] rounded-xl p-5 flex flex-col justify-between transition-colors shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={48} className="text-[#22D3EE]" />
        </div>
        <div>
          <h3 className="text-[10px] font-bold tracking-widest text-slate-500 mb-1.5 uppercase">Total Volume in Transit</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-light text-slate-100 tracking-tight">1.82M</span>
            <span className="text-sm font-medium text-slate-400">bbl/d</span>
          </div>
          <div className="text-xs text-[#22D3EE] font-medium mt-1">
            ↑ 3.6% <span className="text-slate-500 font-normal">vs yesterday</span>
          </div>
        </div>
        <div className="mt-4 w-full">
          <Sparkline color="#22D3EE" data={[1.6, 1.62, 1.58, 1.65, 1.7, 1.75, 1.82]} type="bar" />
        </div>
      </div>

      {/* CARD 2: RESERVE COVER */}
      <div className="bg-[#0B1120] border border-[#1E293B] hover:border-[#334155] rounded-xl p-5 flex flex-col justify-between transition-colors shadow-sm">
        <div>
          <h3 className="text-[10px] font-bold tracking-widest text-slate-500 mb-1.5 uppercase">Strategic Reserve Cover</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-light text-slate-100 tracking-tight">45</span>
            <span className="text-sm font-medium text-slate-400">Days</span>
          </div>
          <div className="text-xs text-[#10B981] font-medium mt-1">
            ↑ 2 Days <span className="text-slate-500 font-normal">at current rate</span>
          </div>
        </div>
        <div className="mt-4 w-full">
          <Sparkline color="#10B981" data={[40, 41, 41, 42, 43, 44, 45]} />
        </div>
      </div>

      {/* CARD 3: DISRUPTION ALERTS */}
      <div className="bg-[#0B1120] border border-[#1E293B] hover:border-[#EF4444]/50 rounded-xl p-5 flex flex-col justify-between transition-colors shadow-[0_0_15px_rgba(239,68,68,0.05)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1.5 h-full bg-[#EF4444]/80"></div>
        <div>
          <h3 className="text-[10px] font-bold tracking-widest text-slate-500 mb-1.5 uppercase">Active Disruption Alerts</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-medium text-[#EF4444] tracking-tight">1</span>
            <span className="text-sm font-bold text-[#EF4444] uppercase tracking-wide">Critical</span>
          </div>
          <div className="text-xs font-semibold text-slate-300 mt-1 truncate">
            Strait of Hormuz Blockade
          </div>
        </div>
        <div className="mt-4 w-full flex items-center justify-between">
          <div className="text-xs text-[#EF4444] font-bold bg-[#EF4444]/10 px-2 py-0.5 rounded">↑ 1</div>
          <div className="w-24">
            <Sparkline color="#EF4444" data={[0, 0, 0, 0, 0, 1, 1]} />
          </div>
        </div>
      </div>

      {/* CARD 4: RISK INDEX */}
      <div className="bg-[#0B1120] border border-[#1E293B] hover:border-[#F59E0B]/50 rounded-xl p-5 flex flex-col justify-between transition-colors shadow-sm">
        <div>
          <h3 className="text-[10px] font-bold tracking-widest text-slate-500 mb-1.5 uppercase">Network Risk Index</h3>
          <div className="flex justify-between items-start">
            <div className="text-xs text-[#F59E0B] font-medium mt-1">
              ↑ 4 <span className="text-slate-500 font-normal">vs yesterday</span>
            </div>
          </div>
        </div>
        <div className="mt-2 w-full">
          <Gauge value={72} label="HIGH" color="#F59E0B" />
        </div>
      </div>

    </div>
  );
}
