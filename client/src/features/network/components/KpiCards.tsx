import { Activity } from 'lucide-react';

export function KpiCards({ loading }: { loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5 xl:mb-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] p-4 animate-pulse h-36">
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
        <svg viewBox="0 0 120 36" className="h-9 w-full overflow-visible" aria-hidden="true">
          <line x1="0" y1="33" x2="120" y2="33" stroke="#24324A" strokeWidth="1" />
          {data.map((val, i) => {
            const h = ((val - min) / range) * 25 + 6;
            const x = 4 + i * 17;
            return <rect key={i} x={x} y={33 - h} width="8" height={h} fill={color} opacity={0.45 + (i / data.length) * 0.5} rx="2" />;
          })}
        </svg>
      );
    }
    
    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - (((val - min) / range) * 25 + 5);
      return `${x + 2},${y + 2}`;
    }).join(' ');

    const areaPoints = `2,34 ${points} 102,34`;

    return (
      <svg viewBox="0 0 104 36" className="h-9 w-full overflow-visible" aria-hidden="true">
        <line x1="2" y1="34" x2="102" y2="34" stroke="#24324A" strokeWidth="1" />
        <polygon points={areaPoints} fill={color} opacity="0.08" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="102" cy="7" r="2.75" fill={color} stroke="#0B1120" strokeWidth="1.5" />
      </svg>
    );
  };

  // Pure SVG Gauge component
  const Gauge = ({ value, label, color }: { value: number, label: string, color: string }) => {
    const percent = value / 100;

    return (
      <div className="relative w-full h-20 flex items-center justify-center">
        <svg viewBox="0 0 120 78" className="w-full h-full overflow-visible" aria-label={`${value} ${label}`}>
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
          <text x="60" y="52" textAnchor="middle" fill={color} fontSize="18" fontWeight="700">{value}</text>
          <text x="60" y="68" textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="700" letterSpacing="1">{label}</text>
        </svg>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-5 xl:mb-6">
      
      {/* CARD 1: VOLUME */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] p-4 flex flex-col h-40 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <Activity size={48} className="text-[#22D3EE]" />
        </div>
        
        {/* Header / Label */}
        <div className="mb-2">
          <h3 className="text-[10px] font-semibold tracking-[0.12em] text-[#5D6C85] uppercase">Total Volume in Transit</h3>
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
        <div className="absolute inset-x-0 bottom-0 flex h-12 items-center border-t border-[#1E293B]/70 bg-[#0E172B]/45 px-4">
          <Sparkline color="#22D3EE" data={[1.6, 1.62, 1.58, 1.65, 1.7, 1.75, 1.82]} type="bar" />
        </div>
      </div>

      {/* CARD 2: RESERVE COVER */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] p-4 flex flex-col h-40 shadow-sm relative overflow-hidden group">
        {/* Header / Label */}
        <div className="mb-2">
          <h3 className="text-[10px] font-semibold tracking-[0.12em] text-[#5D6C85] uppercase">Strategic Reserve Cover</h3>
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
        <div className="absolute inset-x-0 bottom-0 flex h-12 items-center border-t border-[#1E293B]/70 bg-[#0E172B]/45 px-4">
          <Sparkline color="#16D978" data={[40, 41, 41, 42, 43, 44, 45]} />
        </div>
      </div>

      {/* CARD 3: DISRUPTION ALERTS */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] p-4 flex flex-col h-40 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-1.5 h-full bg-[#FF414D]/80"></div>
        
        {/* Header / Label */}
        <div className="mb-2">
          <h3 className="text-[10px] font-semibold tracking-[0.12em] text-[#5D6C85] uppercase">Active Disruption Alerts</h3>
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
        <div className="absolute inset-x-0 bottom-0 flex h-12 items-center gap-3 border-t border-[#1E293B]/70 bg-[#0E172B]/45 px-4">
          <div className="shrink-0 text-[10px] text-[#FF414D] font-bold bg-[#FF414D]/10 px-2 py-0.5 rounded border border-[#FF414D]/20">↑ 1</div>
          <div className="min-w-0 flex-1">
            <Sparkline color="#FF414D" data={[0, 0, 0, 0, 0, 1, 1]} />
          </div>
        </div>
      </div>

      {/* CARD 4: RISK INDEX */}
      <div className="bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] p-4 flex flex-col h-40 shadow-sm relative overflow-hidden group">
        {/* Header / Label */}
        <div className="mb-2">
          <h3 className="text-[10px] font-semibold tracking-[0.12em] text-[#5D6C85] uppercase">Network Risk Index</h3>
        </div>
        
        {/* Value + Trend */}
        <div className="flex flex-col relative">
          <div className="text-[11px] text-[#FF8A00] font-semibold mt-1 flex items-center gap-1 z-10">
            ↑ 4 <span className="text-slate-500 font-medium">vs yesterday</span>
          </div>
        </div>

        {/* Visualization Zone */}
        <div className="absolute inset-x-0 bottom-0 flex h-[74px] items-end justify-end border-t border-[#1E293B]/70 bg-[#0E172B]/45 px-3">
           <div className="h-[72px] w-[58%]">
             <Gauge value={72} label="HIGH" color="#FF8A00" />
           </div>
        </div>
      </div>

    </div>
  );
}
