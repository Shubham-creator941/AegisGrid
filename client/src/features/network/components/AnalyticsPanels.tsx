import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ArrivalsTable } from './ArrivalsTable';
import { Activity } from 'lucide-react';
import { PieChart as PieChartIcon } from 'lucide-react';

export function AnalyticsPanels() {
  const volumeData = [
    { name: 'Petroline (East-West)', value: 0.72, percent: '40%', color: '#22D3EE' },
    { name: 'Strait of Hormuz', value: 0.38, percent: '21%', color: '#EF4444' },
    { name: 'Red Sea Route', value: 0.32, percent: '18%', color: '#F97316' },
    { name: 'Cape Route', value: 0.20, percent: '11%', color: '#F59E0B' },
    { name: 'Other Routes', value: 0.20, percent: '10%', color: '#10B981' },
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
    <div className="grid grid-cols-12 gap-4 h-64">
      {/* Arrivals Table (Left, 5 cols) */}
      <div className="col-span-5 h-full">
        <ArrivalsTable />
      </div>

      {/* Volume by Corridor (Middle, 3 cols) */}
      <div className="col-span-3 bg-[#0B1120] border border-[#1E293B] rounded-xl flex flex-col shadow-sm overflow-hidden h-full">
        <div className="px-4 py-3 border-b border-[#1E293B] bg-[#0F172A]/50">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <PieChartIcon size={14} className="text-[#22D3EE]" />
            <span className="w-3 h-3 rounded-full border-2 border-[#22D3EE]"></span>
            Volume by Corridor
          </h3>
        </div>
        <div className="flex-1 flex flex-col p-4 relative">
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={volumeData}
                  innerRadius={30}
                  outerRadius={50}
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
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[65%] text-center pointer-events-none">
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</div>
               <div className="text-sm font-semibold text-slate-200">1.82M</div>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-1.5 overflow-y-auto">
            {volumeData.map(item => (
              <div key={item.name} className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-1.5 truncate">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-400 truncate">{item.name}</span>
                </div>
                <span className="font-medium text-slate-200 ml-2">{item.percent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reserve Cover Trend (Right, 4 cols) */}
      <div className="col-span-4 bg-[#0B1120] border border-[#1E293B] rounded-xl flex flex-col shadow-sm overflow-hidden h-full">
        <div className="px-4 py-3 border-b border-[#1E293B] bg-[#0F172A]/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <Activity size={14} className="text-[#10B981]" />
            Reserve Cover Trend <span className="text-slate-500 font-medium ml-1 capitalize tracking-normal">(Days)</span>
          </h3>
          <button className="text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors">
            Full Analysis &rarr;
          </button>
        </div>
        <div className="flex-1 p-4 pb-2 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={reserveData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
                itemStyle={{ color: '#10B981' }}
              />
              <Line 
                type="monotone" 
                dataKey="cover" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#10B981', stroke: '#0B1120', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
