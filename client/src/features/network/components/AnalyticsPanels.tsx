import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrivalsTable } from './ArrivalsTable';
import { Activity } from 'lucide-react';
import { PieChart as PieChartIcon } from 'lucide-react';

export function AnalyticsPanels() {
  const volumeData = [
    { name: 'Petroline (East-West)', value: 0.72, percent: '40%', color: 'var(--color-status-recommended)' },
    { name: 'Strait of Hormuz', value: 0.38, percent: '21%', color: 'var(--color-status-critical)' },
    { name: 'Red Sea Route', value: 0.32, percent: '18%', color: 'var(--color-status-warning)' },
    { name: 'Cape Route', value: 0.20, percent: '11%', color: 'var(--color-status-alternative)' },
    { name: 'Other Routes', value: 0.20, percent: '10%', color: 'var(--color-status-normal)' },
  ];

  const reserveData = [
    { date: 'May 20', cover: 42 },
    { date: 'May 21', cover: 42.5 },
    { date: 'May 22', cover: 42.5 },
    { date: 'May 23', cover: 43 },
    { date: 'May 24', cover: 44 },
    { date: 'May 25', cover: 44.5 },
    { date: 'May 26', cover: 45 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1.2fr_0.9fr_1fr] gap-4 lg:gap-6 min-h-[380px] xl:h-[380px] mb-6">
      {/* Arrivals Table (Left, 1.2fr) */}
      <div className="flex flex-col h-full bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] shadow-sm overflow-hidden min-h-[300px]">
        <ArrivalsTable />
      </div>

      {/* Volume by Corridor (Middle, 0.9fr) */}
      <div className="flex flex-col h-full bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] shadow-sm overflow-hidden min-h-[300px]">
        <div className="px-4 py-3 border-b border-[#1E293B] bg-[#0F172A]/50 shrink-0">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <PieChartIcon size={14} className="text-status-recommended" />
            <span className="w-3 h-3 rounded-full border-2 border-status-recommended"></span>
            Volume by Corridor
          </h3>
        </div>
        <div className="flex-1 flex flex-col p-5 overflow-hidden">
          <div className="relative flex-1 min-h-[160px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={volumeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {volumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#E2E8F0' }}
                  formatter={(value: any) => [`${value}M bbl/d`, 'Volume']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Centered Donut Label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none flex flex-col items-center justify-center">
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Total</div>
               <div className="text-lg font-semibold text-slate-200 leading-none">1.82M</div>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col gap-2 shrink-0 overflow-y-auto max-h-[100px] pr-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {volumeData.map(item => (
              <div key={item.name} className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-400 truncate font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-200 ml-3 shrink-0">{item.percent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reserve Cover Trend (Right, 1fr) */}
      <div className="flex flex-col h-full bg-[#0B1120] border border-[#1E293B] rounded-[var(--radius-lg)] shadow-sm overflow-hidden min-h-[300px] md:col-span-2 xl:col-span-1">
        <div className="px-4 py-3 border-b border-[#1E293B] bg-[#0F172A]/50 shrink-0 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-status-normal" />
            Reserve Cover Trend <span className="text-slate-500 font-medium ml-1 capitalize tracking-normal">(Days)</span>
          </h3>
          <button className="text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-aegis-blue rounded p-0.5">
            Full Analysis &rarr;
          </button>
        </div>
        <div className="flex-1 p-5 pb-3 pl-0 overflow-hidden min-h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reserveData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748B" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#64748B" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
                dx={-10}
              />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0B1120', borderColor: '#1E293B', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: 'var(--color-status-normal)' }}
              />
              <Line 
                type="monotone" 
                dataKey="cover" 
                stroke="var(--color-status-normal)" 
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--color-status-normal)', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: 'var(--color-status-normal)', stroke: '#0B1120', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
