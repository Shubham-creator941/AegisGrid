import { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, ShieldAlert, X } from 'lucide-react';
import type { Event } from '../../events/api/events.api';
import { riskTone, toneTextClass } from '../utils/networkSemantics';

export type SimulationEntityType = 'supplier' | 'facility' | 'corridor';

export interface SimulationContext {
  entityType: SimulationEntityType;
  entityId: string;
  entityName: string;
  currentSupply?: string;
  primaryTerminal?: string;
  primaryCorridor?: string;
  riskScore?: number;
  riskLevel: string;
  returnTo: string;
}

interface Props {
  open: boolean;
  context: SimulationContext | null;
  relatedEvent: Event | null;
  eventsLoading: boolean;
  onClose: () => void;
}

export function SimulateDisruptionDialog({ open, context, relatedEvent, eventsLoading, onClose }: Props) {
  const navigate = useNavigate();
  const [severity, setSeverity] = useState(context?.riskLevel || 'CRITICAL');
  const [capacityImpact, setCapacityImpact] = useState('50');
  const [duration, setDuration] = useState('14 Days');
  const [notes, setNotes] = useState('');
  const [scenarioName, setScenarioName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const defaultName = useMemo(() => {
    if (!context) return '';
    return `${context.entityName} ${context.entityType === 'supplier' ? 'Supply' : context.entityType === 'facility' ? 'Facility' : 'Corridor'} Disruption${context.primaryCorridor && context.primaryCorridor !== context.entityName ? ` — ${context.primaryCorridor}` : ''}`;
  }, [context]);

  if (!open || !context) return null;
  const displayedName = scenarioName || defaultName;
  const canAnalyze = Boolean(relatedEvent) && !eventsLoading && !processing;

  const handleAnalyze = () => {
    if (!relatedEvent) {
      setError('No active event is associated with this network corridor. Select a related event before preparing a scenario.');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      navigate(`/app/scenarios?eventId=${encodeURIComponent(relatedEvent.id)}`, {
        state: {
          networkContext: {
            ...context,
            severity,
            capacityImpact,
            duration,
            notes,
            scenarioName: displayedName,
            eventTitle: relatedEvent.title,
          },
        },
      });
    } catch {
      setProcessing(false);
      setError('Unable to prepare scenario. Please verify the selected network context and try again.');
    }
  };

  return createPortal((
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="simulate-title" className="w-full max-w-[620px] max-h-[calc(100dvh-32px)] overflow-y-auto rounded-[var(--radius-lg)] border border-aegis-border bg-aegis-panel shadow-2xl">
        <header className="flex items-start justify-between border-b border-aegis-border p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-aegis-blue/40 bg-aegis-blue/10 text-aegis-blue">
              <ShieldAlert size={19} />
            </div>
            <div>
              <h2 id="simulate-title" className="text-sm font-bold uppercase tracking-widest text-white">Simulate {context.entityType === 'supplier' ? 'Supply' : context.entityType === 'facility' ? 'Facility' : 'Corridor'} Disruption</h2>
              <p className="mt-1 text-sm text-aegis-text-secondary">Model the operational impact of a disruption affecting the selected network entity.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close simulation dialog" className="rounded-[var(--radius-sm)] p-1.5 text-aegis-text-muted hover:bg-aegis-elevated hover:text-white"><X size={18} /></button>
        </header>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-2 gap-3 rounded-[var(--radius-md)] border border-aegis-border bg-aegis-base p-4 text-sm sm:grid-cols-3">
            <ContextValue label={context.entityType} value={context.entityName} />
            <ContextValue label={context.entityType === 'corridor' ? 'Throughput' : 'Current Supply'} value={context.currentSupply || 'Not reported'} />
            <ContextValue label="Primary Terminal" value={context.primaryTerminal || 'Not applicable'} />
            <ContextValue label="Corridor" value={context.primaryCorridor || 'Not associated'} />
            <ContextValue label="Current Risk" value={`${context.riskScore ?? '—'} / ${context.riskLevel}`} tone={riskTone(context.riskScore)} />
            <ContextValue label="Related Event" value={eventsLoading ? 'Resolving…' : relatedEvent?.title || 'No active match'} />
          </div>

          {!eventsLoading && !relatedEvent && (
            <div className="flex gap-2 rounded-[var(--radius-md)] border border-aegis-yellow/30 bg-aegis-yellow/10 p-3 text-sm text-aegis-yellow">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              No active event currently matches {context.primaryCorridor || context.entityName}. Scenario analysis requires an existing related event.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SelectField label="Disruption Severity" value={severity} onChange={setSeverity} options={['MODERATE', 'HIGH', 'CRITICAL']} />
            <SelectField label="Capacity Impact" value={capacityImpact} onChange={setCapacityImpact} options={['25', '50', '75', '100']} format={(v) => `${v}%`} />
            <SelectField label="Expected Duration" value={duration} onChange={setDuration} options={['24 Hours', '7 Days', '14 Days', '30 Days']} />
          </div>

          <div>
            <label htmlFor="scenario-name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-aegis-text-secondary">Scenario Name</label>
            <input id="scenario-name" value={displayedName} onChange={(event) => setScenarioName(event.target.value)} className="h-11 w-full rounded-[var(--radius-md)] border border-aegis-border bg-aegis-base px-3 text-sm text-white focus:border-aegis-blue" />
          </div>
          <div>
            <label htmlFor="scenario-notes" className="mb-2 block text-xs font-bold uppercase tracking-wider text-aegis-text-secondary">Optional Notes</label>
            <textarea id="scenario-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} placeholder="Add operational context for the scenario team…" className="w-full resize-none rounded-[var(--radius-md)] border border-aegis-border bg-aegis-base px-3 py-2.5 text-sm text-white placeholder:text-aegis-text-muted focus:border-aegis-blue" />
          </div>
          {error && <p role="alert" className="text-sm text-aegis-red">{error}</p>}
        </div>

        <footer className="flex justify-end gap-3 border-t border-aegis-border p-5">
          <button type="button" onClick={onClose} disabled={processing} className="h-10 rounded-[var(--radius-md)] border border-aegis-border px-4 text-sm font-semibold text-aegis-text-secondary hover:bg-aegis-elevated hover:text-white active:bg-aegis-base">Cancel</button>
          <button type="button" onClick={handleAnalyze} disabled={!canAnalyze} className="flex h-10 items-center gap-2 rounded-[var(--radius-md)] bg-aegis-blue px-5 text-sm font-semibold text-white hover:bg-aegis-blue-hover active:brightness-90 disabled:bg-aegis-border disabled:text-aegis-text-muted">
            {processing ? 'Preparing Scenario…' : <>Analyze Scenario <ArrowRight size={16} /></>}
          </button>
        </footer>
      </section>
    </div>
  ), document.body);
}

function ContextValue({ label, value, tone }: { label: string; value: string; tone?: ReturnType<typeof riskTone> }) {
  return <div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-wider text-aegis-text-muted">{label}</div><div className={`mt-1 break-words font-medium ${tone ? toneTextClass[tone] : 'text-white'}`}>{value}</div></div>;
}

function SelectField({ label, value, onChange, options, format = (v) => v }: { label: string; value: string; onChange: (value: string) => void; options: string[]; format?: (value: string) => string }) {
  return <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider text-aegis-text-secondary">{label}</label><select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-[var(--radius-md)] border border-aegis-border bg-aegis-base px-3 text-sm text-white focus:border-aegis-blue">{options.map(option => <option key={option} value={option}>{format(option)}</option>)}</select></div>;
}
