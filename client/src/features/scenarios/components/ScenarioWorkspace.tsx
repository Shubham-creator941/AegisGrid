import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, ChevronLeft, FileText, Info, MapPin, Play, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useEventDetail } from '../../events/hooks/useEvents';
import { useScenario } from '../hooks/useScenarios';

interface NetworkScenarioContext {
  entityType: 'supplier' | 'facility' | 'corridor'; entityId: string; entityName: string;
  currentSupply?: string; primaryTerminal?: string; primaryCorridor?: string;
  riskScore?: number; riskLevel: string; returnTo: string; severity: string;
  capacityImpact: string; duration: string; notes?: string; scenarioName: string; eventTitle: string;
}

interface EventScenarioContext {
  title: string; type: string; severity: string; location: string; exposureIndex: string;
  impactDuration: string; volumeAtRisk: string; returnTo: string;
}

export default function ScenarioWorkspace() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId') || undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const networkContext = (location.state as { networkContext?: NetworkScenarioContext } | null)?.networkContext;
  const eventContext = (location.state as { eventContext?: EventScenarioContext } | null)?.eventContext;
  const { data: event, loading: eventLoading, error: eventError } = useEventDetail(eventId);
  const { createScenario, evaluateScenario, error: scenarioError } = useScenario();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const submissionLock = useRef(false);

  const sourceTitle = eventContext?.title || networkContext?.eventTitle || event?.title || '';
  const sourceType = eventContext?.type || event?.event_type;
  const sourceSeverity = eventContext?.severity || event?.severity;
  const sourceLocation = eventContext?.location || event?.affected_region || networkContext?.primaryCorridor;
  const returnTo = networkContext?.returnTo || eventContext?.returnTo || (eventId ? `/app/events?eventId=${encodeURIComponent(eventId)}` : '/app/events');

  useEffect(() => {
    if (!sourceTitle) return;
    if (networkContext) {
      setName(networkContext.scenarioName);
      setDescription(`${networkContext.severity} disruption assumption for ${networkContext.entityName}: ${networkContext.capacityImpact}% capacity interruption for ${networkContext.duration}${networkContext.primaryCorridor ? ` affecting ${networkContext.primaryCorridor}` : ''}.${networkContext.notes ? ` Notes: ${networkContext.notes}` : ''}`);
      return;
    }
    setName(`Scenario for: ${sourceTitle}`);
    setDescription(`Evaluate operational impact and response options for ${sourceTitle}${sourceLocation ? ` in ${sourceLocation}` : ''}.`);
  }, [sourceTitle, sourceLocation, networkContext]);

  const handleEvaluate = async () => {
    if (submissionLock.current || submitting) return;
    if (!name.trim() || !description.trim() || !eventId || !user?.id) {
      setActionError('Complete the scenario name and description before evaluation.');
      return;
    }
    submissionLock.current = true;
    setSubmitting(true);
    setActionError('');
    try {
      const scenario = await createScenario({ name: name.trim(), description: description.trim(), event_id: eventId, created_by: user.id });
      const result = await evaluateScenario(scenario.id, `eval_${scenario.id}_${Date.now()}`);
      const evaluationId = result?.evaluation?.id;
      if (!evaluationId) throw new Error('EVALUATION_ID_MISSING');
      navigate(`/app/evaluations?evaluationId=${encodeURIComponent(evaluationId)}`);
    } catch {
      setActionError('Unable to evaluate scenario. Review the scenario inputs and try again.');
    } finally {
      submissionLock.current = false;
      setSubmitting(false);
    }
  };

  if (!eventId) return <EmptyState onReturn={() => navigate('/app/events')} />;
  if (eventLoading && !eventContext && !networkContext) return <div className="flex h-full items-center justify-center text-sm text-aegis-text-secondary"><span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-aegis-border border-t-aegis-blue" />Resolving event context…</div>;
  if ((!event && !eventContext && !networkContext) || eventError) return <EmptyState title="Event Context Unavailable" message="The selected event could not be loaded. Return to Events and select an active disruption before creating a scenario." onReturn={() => navigate('/app/events')} />;

  const displayedError = actionError || (scenarioError ? 'Unable to evaluate scenario. Review the scenario inputs and try again.' : '');

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden pb-8 text-aegis-text">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5">
        <button onClick={() => navigate(returnTo)} className="flex w-fit items-center gap-1.5 text-xs text-aegis-text-secondary transition-colors hover:text-white"><ChevronLeft size={14} />Back to {networkContext ? 'Network' : 'Events'}</button>
        <header className="rounded-xl border border-aegis-border bg-aegis-panel p-5 shadow-lg md:p-6">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
            <div className="min-w-0"><div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-aegis-blue">Scenario Workspace</div><h1 className="text-2xl font-semibold text-white">{sourceTitle}</h1><p className="mt-1 text-sm text-aegis-text-secondary">Configure an operator scenario, then evaluate its network impact and response options.</p></div>
            <div className="flex shrink-0 flex-wrap items-center gap-2"><span className="rounded-md border border-aegis-border bg-aegis-base px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-aegis-text-secondary">Draft configuration</span>{sourceSeverity && <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${sourceSeverity === 'CRITICAL' ? 'border-aegis-red/30 bg-aegis-red/10 text-aegis-red' : 'border-aegis-yellow/30 bg-aegis-yellow/10 text-aegis-yellow'}`}><ShieldAlert size={12} className="mr-1.5 inline" />{sourceSeverity}</span>}</div>
          </div>
        </header>

        {displayedError && <div role="alert" className="flex items-start gap-3 rounded-lg border border-aegis-red/30 bg-aegis-red/10 p-4 text-sm text-aegis-red"><AlertCircle size={18} className="mt-0.5 shrink-0" /><div><div className="font-semibold">Scenario evaluation failed</div><div className="mt-1 text-aegis-red/80">{displayedError}</div></div></div>}

        <div className="grid min-w-0 grid-cols-1 items-start gap-5 min-[1100px]:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] xl:gap-6">
          <div className="flex min-w-0 flex-col gap-5">
            <section className="rounded-xl border border-aegis-border bg-aegis-panel p-5 shadow-lg">
              <SectionTitle icon={<MapPin size={16} className="text-aegis-blue" />} title="Source Context" />
              <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2"><ContextRow label="Origin" value={networkContext ? 'Network Intelligence' : 'Events'} /><ContextRow label="Selected Event" value={sourceTitle} />{sourceLocation && <ContextRow label="Location / Corridor" value={sourceLocation} />}{sourceType && <ContextRow label="Event Type" value={sourceType.replaceAll('_', ' ')} />}{networkContext && <ContextRow label={networkContext.entityType} value={networkContext.entityName} />}{networkContext?.primaryTerminal && <ContextRow label="Primary Terminal" value={networkContext.primaryTerminal} />}</div>
            </section>

            <section className="rounded-xl border border-aegis-border bg-aegis-panel p-5 shadow-lg">
              <SectionTitle icon={<Info size={16} className="text-aegis-yellow" />} title="Operator Assumptions" />
              {networkContext ? <div className="grid grid-cols-2 gap-x-5"><ContextRow label="Severity" value={networkContext.severity} /><ContextRow label="Capacity Impact" value={`${networkContext.capacityImpact}%`} /><ContextRow label="Duration" value={networkContext.duration} />{networkContext.notes && <ContextRow label="Notes" value={networkContext.notes} />}</div> : <p className="text-sm leading-relaxed text-aegis-text-secondary">The scenario name and operational description are the operator-defined assumptions supported by the current scenario contract.</p>}
            </section>

            <section className="rounded-xl border border-dashed border-aegis-border bg-aegis-panel/50 p-5"><div className="text-xs font-bold uppercase tracking-widest text-aegis-text-secondary">Model Output</div><p className="mt-2 text-sm leading-relaxed text-aegis-text-muted">Evaluation not yet run. Configure this scenario and select “Evaluate Scenario” to generate impact analysis and ranked responses.</p></section>
          </div>

          <section className="min-w-0 overflow-hidden rounded-xl border border-aegis-border bg-aegis-panel shadow-lg">
            <div className="flex items-center gap-2 border-b border-aegis-border bg-aegis-elevated px-5 py-4"><FileText size={16} className="text-aegis-purple" /><h2 className="text-xs font-bold uppercase tracking-widest text-white">Scenario Configuration</h2></div>
            <div className="space-y-4 p-5">
              <div><label htmlFor="scenario-name" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-aegis-text-muted">Scenario Name</label><input id="scenario-name" value={name} onChange={e => setName(e.target.value)} disabled={submitting} className="h-11 w-full rounded-md border border-aegis-border bg-aegis-base px-3 text-sm text-white focus:border-aegis-blue disabled:opacity-50" /></div>
              <div><label htmlFor="scenario-description" className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-aegis-text-muted">Operational Description</label><textarea id="scenario-description" value={description} onChange={e => setDescription(e.target.value)} disabled={submitting} rows={4} className="w-full resize-none rounded-md border border-aegis-border bg-aegis-base px-3 py-3 text-sm leading-relaxed text-white focus:border-aegis-blue disabled:opacity-50" /></div>
              <div className="border-t border-aegis-border pt-4"><button onClick={handleEvaluate} disabled={submitting || !name.trim() || !description.trim()} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-aegis-blue px-6 text-sm font-semibold text-white shadow-[0_0_12px_rgba(47,140,255,0.22)] hover:bg-aegis-blue-hover disabled:bg-aegis-border disabled:text-aegis-text-muted disabled:shadow-none">{submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />Evaluating Scenario…</> : <><Play size={16} fill="currentColor" />Evaluate Scenario <ArrowRight size={16} /></>}</button><p className="mt-2 text-center text-[10px] text-aegis-text-muted">Creates one scenario and continues to the existing Evaluation workspace.</p></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="mb-4 flex items-center gap-2 border-b border-aegis-border pb-3">{icon}<h2 className="text-xs font-bold uppercase tracking-widest text-white">{title}</h2></div>; }
function ContextRow({ label, value }: { label: string; value: string }) { return <div className="min-w-0 border-b border-aegis-border/50 py-3 last:border-b-0"><div className="text-[10px] font-bold uppercase tracking-wider text-aegis-text-muted">{label}</div><div className="mt-1 break-words text-sm font-medium text-white">{value}</div></div>; }
function EmptyState({ title = 'No Event Selected', message = 'A scenario must be linked to an existing disruption event. Select an event to begin scenario configuration.', onReturn }: { title?: string; message?: string; onReturn: () => void }) { return <div className="flex h-full flex-col items-center justify-center text-aegis-text-muted"><AlertCircle size={44} className="mb-4 text-aegis-red/70" /><h2 className="text-xl font-semibold text-white">{title}</h2><p className="mt-2 max-w-md text-center text-sm leading-relaxed">{message}</p><button onClick={onReturn} className="mt-6 h-10 rounded-md bg-aegis-blue px-5 text-sm font-semibold text-white hover:bg-aegis-blue-hover">View Events</button></div>; }
