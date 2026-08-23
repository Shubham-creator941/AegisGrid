import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, BrainCircuit, ChevronRight, Clock, Database, MapPin, ShieldAlert, ShieldCheck, Tag, Target } from 'lucide-react';
import type { Event } from '../api/events.api';

type EventProfile = {
  corridors: string[]; assets: string[]; radius: [string, string, string]; volume: string;
  exposure: string; severity: string; confidence: string; duration: string; recommendation: string;
};

const PROFILES: Record<string, EventProfile> = {
  'Strait of Hormuz Blockade': { corridors: ['Strait of Hormuz', 'Gulf → Arabian Sea'], assets: ['Naval Traffic', 'Tankers', 'Energy Exports'], radius: ['350', '650', '1000'], volume: '18.4M bbl/d', exposure: '0.85', severity: '0.95', confidence: '90.0%', duration: '30 Days', recommendation: 'Activate alternative routing via Saudi East-West bypass' },
  'Red Sea Shipping Disruption': { corridors: ['Bab-el-Mandeb', 'Red Sea ↔ Arabian Sea'], assets: ['Commercial Vessels', 'Container Traffic', 'Energy Cargo'], radius: ['220', '480', '800'], volume: '4.8M bbl/d', exposure: '0.68', severity: '0.72', confidence: '86.0%', duration: '14 Days', recommendation: 'Evaluate Cape routing and protect priority cargo windows' },
  'Taiwan Strait Transit Risk': { corridors: ['Taiwan Strait', 'South China Sea → East China Sea'], assets: ['Commercial Shipping', 'LNG Cargo', 'Port Operations'], radius: ['180', '420', '700'], volume: '12.0M bbl/d', exposure: '0.54', severity: '0.61', confidence: '78.0%', duration: '7 Days', recommendation: 'Maintain monitoring and prepare alternate transit windows' },
};

const FALLBACK_PROFILE: EventProfile = { corridors: [], assets: [], radius: ['—', '—', '—'], volume: 'Not reported', exposure: '—', severity: '—', confidence: 'Not reported', duration: 'Not reported', recommendation: 'Continue monitoring and validate operational alternatives' };

export function EventWorkspace({ event }: { event: Event }) {
  const navigate = useNavigate();
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const profile = PROFILES[event.title] || FALLBACK_PROFILE;
  const analyzed = event.status === 'ANALYZED' || event.status === 'ASSESSED';
  const severityColor = event.severity === 'CRITICAL' ? 'text-[#FF4545] border-[#FF4545]/30 bg-[#FF4545]/10' : event.severity === 'ELEVATED' ? 'text-[#FFB000] border-[#FFB000]/30 bg-[#FFB000]/10' : 'text-[#6CA8FF] border-[#6CA8FF]/30 bg-[#6CA8FF]/10';
  const openScenario = () => navigate(`/app/scenarios?eventId=${encodeURIComponent(event.id)}`, { state: { eventContext: { title: event.title, type: event.event_type, severity: event.severity, location: event.affected_region, exposureIndex: profile.exposure, impactDuration: profile.duration, volumeAtRisk: profile.volume, returnTo: `/app/events?eventId=${encodeURIComponent(event.id)}` } } });
  const detected = new Date(event.detected_at);

  return <div className="flex min-w-0 flex-col">
    <header className="mb-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className={`flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${severityColor}`}><ShieldAlert size={14} />{event.severity}</span>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded border border-[#1E304D] bg-[#121D34] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#91A4BF]">{analyzed ? 'ANALYZED' : event.status}</span>
          <button onClick={openScenario} className="flex h-9 items-center gap-2 rounded-md bg-[#2F8CFF] px-4 text-xs font-semibold text-white shadow-[0_0_12px_rgba(47,140,255,0.24)] hover:bg-[#3FA0FF]">Analyze in Scenarios <ArrowRight size={14} /></button>
        </div>
      </div>
      <h2 className="mb-1 text-2xl font-bold text-[#E6EDF7]">{event.title}</h2>
      <p className="mb-5 max-w-4xl text-sm leading-relaxed text-[#91A4BF]">{event.description}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Meta icon={<Clock size={14} />} label="Detected" value={detected.toLocaleString('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} />
        <Meta icon={<MapPin size={14} />} label="Location" value={event.affected_region} />
        <Meta icon={<Tag size={14} />} label="Event Type" value={event.event_type} />
      </div>
    </header>

    <div className="grid min-w-0 grid-cols-1 gap-5 min-[1800px]:grid-cols-12">
      <div className="flex min-w-0 flex-col gap-5 min-[1800px]:col-span-8">
        <div className="grid grid-cols-1 gap-5 min-[1600px]:grid-cols-2">
          <Card title="Confirmed Facts" icon={<Database size={16} className="text-[#2F8CFF]" />}>
            <Fact label="Event Description">{event.description}</Fact>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Fact label="Location">{event.affected_region}</Fact><Fact label="Detected Time">{detected.toLocaleString('en-GB')}</Fact></div>
            <Fact label="Affected Corridors"><Tags values={profile.corridors} /></Fact>
            <Fact label="Affected Assets"><Tags values={profile.assets} muted /></Fact>
          </Card>

          <Card title="Risk / Impact" icon={<Target size={16} className="text-[#FFB000]" />}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#657994]">Impact Radius</div>
            <div className="grid min-h-[230px] grid-cols-1 items-center gap-5 sm:grid-cols-[210px_1fr]">
              <div className="relative mx-auto flex h-[210px] w-[210px] items-center justify-center">
                <div className="absolute inset-1 rounded-full border border-[#FFB000]/30" /><div className="absolute h-[156px] w-[156px] rounded-full border border-[#FF7B00]/45" /><div className="absolute flex h-[102px] w-[102px] items-center justify-center rounded-full border border-[#FF4545]/65 bg-[#FF4545]/10 shadow-[0_0_20px_rgba(255,69,69,.18)]"><div className="text-center"><div className="text-xl font-bold">{profile.radius[0]}</div><div className="text-[10px] font-bold text-[#FF4545]">NM</div></div></div>
              </div>
              <div className="space-y-3"><Radius color="bg-[#FF4545]" label="Direct Impact" value={`${profile.radius[0]} NM`} /><Radius color="bg-[#FF7B00]" label="Secondary Impact" value={`${profile.radius[1]} NM`} /><Radius color="bg-[#FFB000]" label="Extended Impact" value={`${profile.radius[2]} NM`} /></div>
            </div>
            <div className="border-t border-[#1E304D] pt-4"><div className="text-[10px] font-bold uppercase tracking-wider text-[#657994]">Impacted Volume</div><div className="mt-1 text-xl font-bold">{profile.volume}</div></div>
          </Card>
        </div>

        <Timeline expanded={timelineExpanded} onToggle={() => setTimelineExpanded(value => !value)} />
        <Card title="Current Status" icon={<ShieldCheck size={16} className="text-[#20C77A]" />}>
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center"><div className="min-w-0"><span className="rounded border border-[#20C77A]/20 bg-[#20C77A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#20C77A]">Active</span><p className="mt-2 text-xs leading-relaxed text-[#91A4BF]">Event is ongoing. Continuous monitoring and intelligence updates in progress.</p></div><div className="grid shrink-0 grid-cols-3 gap-3 text-xs"><Status value="Continuous" label="Monitoring" /><Status value="04:00 PM" label="Last Update" /><Status value="04:30 PM" label="Next Review" /></div></div>
        </Card>
      </div>

      <aside className="flex min-w-0 flex-col gap-5 min-[1800px]:col-span-4">
        <Card title="AI Inference" icon={<BrainCircuit size={16} className="text-[#B45CFF]" />}>
          <div className="mb-2 flex flex-wrap justify-between gap-2 text-[9px] font-bold uppercase tracking-wider text-[#657994]"><span>Model: Aegis Intelligence v2.1</span><span>Confidence: {profile.confidence}</span></div>
          <div className="overflow-hidden rounded-lg border border-[#1E304D] bg-[#060B18]">
            <div className="grid grid-cols-2 border-b border-[#1E304D]">
              <InferenceMetric label="Threat Level" value={event.severity === 'CRITICAL' ? 'HIGH' : event.severity} tone="critical" />
              <InferenceMetric label="Impact Duration" value={profile.duration} />
            </div>
            <div className="grid grid-cols-2 border-b border-[#1E304D]">
              <InferenceMetric label="Probability" value={profile.confidence} tone="warning" />
              <InferenceMetric label="Affected Nodes" value={`${profile.corridors.length} identified`} />
            </div>
            <div className="p-4">
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#657994]">Affected Network</div>
              <div className="mt-2 flex flex-wrap gap-2">{profile.corridors.map(corridor => <span key={corridor} className="max-w-full break-words rounded border border-[#2F8CFF]/25 bg-[#121D34] px-2.5 py-1 text-[11px] text-[#91A4BF]">{corridor}</span>)}</div>
            </div>
            <div className="border-t border-[#1E304D] bg-[#121D34]/45 p-4">
              <div className="text-[9px] font-bold uppercase tracking-wider text-[#657994]">Recommended Action</div>
              <p className="mt-2 text-xs leading-relaxed text-[#E6EDF7]">{profile.recommendation}</p>
            </div>
          </div>
        </Card>
        <Card title="Risk Metrics" icon={<Activity size={16} className="text-[#32B7FF]" />}><Metric label="Risk Level" value={event.severity} critical={event.severity === 'CRITICAL'} /><Metric label="Exposure Index" value={profile.exposure} /><Metric label="Severity" value={profile.severity} /><Metric label="Confidence" value={profile.confidence} /><Metric label="Volume at Risk" value={profile.volume} /><Metric label="Potential Impact Duration" value={profile.duration} last /></Card>
        <Card title="Recommended Actions" icon={<ShieldCheck size={16} className="text-[#32B7FF]" />}>
          <ul className="space-y-3 text-xs text-[#E6EDF7]">{['Monitor naval movements in the area', 'Evaluate alternative routing options', 'Prepare contingency supply plans', 'Increase intelligence collection frequency'].map(action => <li key={action} className="flex gap-3"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#20C77A]" />{action}</li>)}</ul>
          <div className="mt-5 flex flex-wrap gap-3 border-t border-[#1E304D] pt-4"><button onClick={openScenario} className="flex items-center gap-2 rounded-md bg-[#2F8CFF] px-3 py-2 text-[11px] font-semibold text-white hover:bg-[#3FA0FF]">Open Scenario Analysis <ArrowRight size={12} /></button><button onClick={() => navigate(`/app/recommendations?eventId=${encodeURIComponent(event.id)}`)} className="flex items-center gap-1.5 rounded border border-[#1E304D] bg-[#121D34] px-3 py-2 text-[11px] font-medium text-[#2F8CFF] hover:text-white">View All Recommendations <ChevronRight size={12} /></button></div>
        </Card>
      </aside>
    </div>
  </div>;
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <section className="min-w-0 rounded-xl border border-[#1E304D] bg-[#0E172B] p-5"><div className="mb-5 flex items-center gap-2">{icon}<h3 className="text-xs font-bold uppercase tracking-wider text-[#E6EDF7]">{title}</h3></div><div className="space-y-4">{children}</div></section>; }
function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="min-w-0 rounded-lg border border-[#1E304D] bg-[#121D34] p-4"><div className="mb-2 flex items-center gap-2 text-[#657994]">{icon}<span className="text-[10px] font-bold uppercase tracking-wider">{label}</span></div><div className="break-words text-xs font-semibold text-[#E6EDF7] xl:text-sm">{value}</div></div>; }
function Fact({ label, children }: { label: string; children: React.ReactNode }) { return <div><div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#657994]">{label}</div><div className="text-sm leading-relaxed text-[#E6EDF7]">{children}</div></div>; }
function Tags({ values, muted = false }: { values: string[]; muted?: boolean }) { return <div className="flex flex-wrap gap-2">{values.length ? values.map(value => <span key={value} className={`max-w-full break-words rounded border px-2.5 py-1 text-xs ${muted ? 'border-[#1E304D] bg-[#121D34] text-[#91A4BF]' : 'border-[#2F8CFF]/30 bg-[#121D34] text-[#2F8CFF]'}`}>{value}</span>) : <span className="text-[#657994]">Not reported</span>}</div>; }
function Radius({ color, label, value }: { color: string; label: string; value: string }) { return <div className="flex items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${color}`} /><div className="text-[10px] leading-tight text-[#91A4BF]">{label}<div className="mt-0.5 font-semibold text-[#E6EDF7]">{value}</div></div></div>; }
function Metric({ label, value, critical = false, last = false }: { label: string; value: string; critical?: boolean; last?: boolean }) { return <div className={`flex min-h-9 items-center justify-between gap-4 ${last ? '' : 'border-b border-[#1E304D]/50 pb-3'}`}><span className="text-sm text-[#91A4BF]">{label}</span><span className={`shrink-0 text-right text-sm font-semibold ${critical ? 'text-[#FF4545]' : 'text-[#E6EDF7]'}`}>{value}</span></div>; }
function InferenceMetric({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'critical' | 'warning' }) { const color = tone === 'critical' ? 'text-[#FF4545]' : tone === 'warning' ? 'text-[#FFB000]' : 'text-[#E6EDF7]'; return <div className="min-w-0 border-r border-[#1E304D] p-4 last:border-r-0"><div className="text-[9px] font-bold uppercase tracking-wider text-[#657994]">{label}</div><div className={`mt-1 break-words text-sm font-semibold ${color}`}>{value}</div></div>; }
function Status({ value, label }: { value: string; label: string }) { return <div className="min-w-0 text-center"><div className="break-words font-semibold text-[#91A4BF]">{value}</div><div className="mt-0.5 break-words text-[9px] uppercase tracking-wider text-[#657994]">{label}</div></div>; }

function Timeline({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const points = [['02:50 PM', 'Event Detected'], ['03:10 PM', 'Initial Assessment'], ['03:25 PM', 'Risk Analysis'], ['03:40 PM', 'Impact Modeling'], ['04:00 PM', 'Intelligence Update']];
  return <Card title="Timeline" icon={<Clock size={16} className="text-[#E6EDF7]" />}><div className="overflow-x-auto pb-2"><div className="relative flex min-w-[620px] justify-between px-3 pt-2"><div className="absolute left-7 right-7 top-[17px] h-0.5 bg-[#1E304D]" />{points.map(([time, label], index) => <div key={time} className="relative z-10 flex w-28 flex-col items-center text-center"><span className={`mb-3 h-[18px] w-[18px] rounded-full border-4 border-[#0E172B] ${index === 0 ? 'bg-[#FF4545]' : index < 3 ? 'bg-[#2F8CFF]' : 'bg-[#40516B]'}`} /><span className={`text-[10px] font-bold ${index === 0 ? 'text-[#FF4545]' : 'text-[#91A4BF]'}`}>{time}</span><span className="mt-1 text-[11px] text-[#E6EDF7]">{label}</span></div>)}</div></div>{expanded && <div className="rounded-lg border border-[#1E304D] bg-[#121D34] p-4 text-xs leading-relaxed text-[#91A4BF]">Full operational timeline is displayed above. Intelligence updates remain under continuous review; no additional validated milestones are available.</div>}<div className="flex justify-end"><button onClick={onToggle} className="flex items-center gap-1.5 text-xs font-medium text-[#2F8CFF] hover:text-white">{expanded ? 'Collapse Timeline' : 'View Full Timeline'} <ChevronRight size={14} className={expanded ? 'rotate-90' : ''} /></button></div></Card>;
}
