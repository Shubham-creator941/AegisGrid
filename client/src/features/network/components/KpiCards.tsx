import { Activity } from 'lucide-react';

export function KpiCards({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] p-5 animate-pulse h-32">
            <div className="h-4 bg-slate-800 rounded-md w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-800 rounded-md w-1/3"></div>
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      
      {/* CARD 1: VOLUME */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] p-5 flex flex-col h-[180px] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Activity size={48} className="text-[#22D3EE]" />
        </div>
        
        {/* Header / Label */}
        <div className="mb-2">
          <h3 className="text-[11px] font-semibold tracking-widest text-[#5D6C85] uppercase">Total Volume in Transit</h3>
        </div>
        
        {/* Value + Trend */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-slate-100 tracking-tight leading-none">1.82M</span>
            <span className="text-sm font-medium text-slate-500">bbl/d</span>
          </div>
          <div className="text-[11px] text-[#22D3EE] font-semibold mt-1.5 flex items-center gap-1">
            ↑ 3.6% <span className="text-slate-500 font-medium">vs yesterday</span>
          </div>
        </div>

        {/* Visualization Zone */}
        <div className="mt-auto w-full pt-4">
          <Sparkline color="#22D3EE" data={[1.6, 1.62, 1.58, 1.65, 1.7, 1.75, 1.82]} type="bar" />
        </div>
      </div>

      {/* CARD 2: RESERVE COVER */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] p-5 flex flex-col h-[180px] shadow-sm group">
        {/* Header / Label */}
        <div className="mb-2">
          <h3 className="text-[11px] font-semibold tracking-widest text-[#5D6C85] uppercase">Strategic Reserve Cover</h3>
        </div>
        
        {/* Value + Trend */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-slate-100 tracking-tight leading-none">45</span>
            <span className="text-sm font-medium text-slate-500">Days</span>
          </div>
          <div className="text-[11px] text-[#16D978] font-semibold mt-1.5 flex items-center gap-1">
            ↑ 2 Days <span className="text-slate-500 font-medium">at current rate</span>
          </div>
        </div>

        {/* Visualization Zone */}
        <div className="mt-auto w-full pt-4">
          <Sparkline color="#16D978" data={[40, 41, 41, 42, 43, 44, 45]} />
        </div>
      </div>

      {/* CARD 3: DISRUPTION ALERTS */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] p-5 flex flex-col h-[180px] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-1.5 h-full bg-[#FF414D]/80"></div>
        
        {/* Header / Label */}
        <div className="mb-2">
          <h3 className="text-[11px] font-semibold tracking-widest text-[#5D6C85] uppercase">Active Disruption Alerts</h3>
        </div>
        
        {/* Value + Trend */}
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] font-semibold text-[#FF414D] tracking-tight leading-none">1</span>
            <span className="text-sm font-bold text-[#FF414D] uppercase tracking-wide">Critical</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-300 mt-1.5 truncate">
            Strait of Hormuz Blockade
          </div>
        </div>

        {/* Visualization Zone */}
        <div className="mt-auto w-full pt-4 flex items-center justify-between gap-4">
          <div className="text-[10px] text-[#FF414D] font-bold bg-[#FF414D]/10 px-2 py-0.5 rounded border border-[#FF414D]/20">↑ 1</div>
          <div className="flex-1">
            <Sparkline color="#FF414D" data={[0, 0, 0, 0, 0, 1, 1]} />
          </div>
        </div>
      </div>

      {/* CARD 4: RISK INDEX */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] p-5 flex flex-col h-[180px] shadow-sm group">
        {/* Header / Label */}
        <div className="mb-2">
          <h3 className="text-[11px] font-semibold tracking-widest text-[#5D6C85] uppercase">Network Risk Index</h3>
        </div>
        
        {/* Value + Trend */}
        <div className="flex flex-col relative">
          <div className="flex items-baseline gap-2 invisible h-0">
            {/* Hidden spacer to maintain exact identical geometry */}
            <span className="text-[28px] font-semibold leading-none">0</span>
          </div>
          <div className="text-[11px] text-[#FF8A00] font-semibold mt-1.5 flex items-center gap-1 z-10">
            ↑ 4 <span className="text-slate-500 font-medium">vs yesterday</span>
          </div>
        </div>

        {/* Visualization Zone */}
        <div className="mt-auto w-full pt-4 pb-2 relative">
           <div className="absolute bottom-6 w-full -mt-8">
             <Gauge value={72} label="HIGH" color="#FF8A00" />
           </div>
        </div>
      </div>

    </div>
  );
}
