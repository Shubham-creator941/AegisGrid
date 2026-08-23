import { useState, useEffect } from 'react';
import type { AuditLog, PaginatedResult, AuditFilters } from '../features/audit/api/audit.api';
import { AuditApi } from '../features/audit/api/audit.api';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from 'shared';
import { ShieldAlert, Search, X, ChevronLeft, ChevronRight, Activity, Clock, User, Box, ShieldCheck, FileText } from 'lucide-react';

export default function Audit() {
  const { user } = useAuth();
  const [data, setData] = useState<PaginatedResult<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const pageSize = 50;
  
  const [filters, setFilters] = useState<AuditFilters>({
    actor_id: '',
    action: '',
    entity_type: '',
    entity_id: ''
  });
  
  const [activeFilters, setActiveFilters] = useState<AuditFilters>({});
  
  const [selectedRecord, setSelectedRecord] = useState<AuditLog | null>(null);

  const fetchLogs = async (currentPage: number, currentFilters: AuditFilters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuditApi.listAuditLogs(currentPage, pageSize, currentFilters);
      setData(result);
      if (selectedRecord && !result.data.find(r => r.id === selectedRecord.id)) {
        setSelectedRecord(null);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Forbidden: You do not have the required ADMIN permission to view audit logs.');
      } else {
        setError(err.message || 'Unable to load audit records.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      setError('Forbidden: You do not have the required ADMIN permission to view audit logs.');
      setLoading(false);
      return;
    }
    fetchLogs(page, activeFilters);
  }, [page, activeFilters, user]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveFilters({ ...filters });
  };

  const handleClearFilters = () => {
    setFilters({ actor_id: '', action: '', entity_type: '', entity_id: '' });
    setActiveFilters({});
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
      const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
      return `${day} · ${time}`;
    } catch {
      return dateString;
    }
  };

  const getActionBadge = (action: string) => {
    if (action.includes('ACCEPT')) return 'bg-blue-900/40 text-blue-400 border-blue-900/50';
    if (action.includes('MODIFY') || action.includes('UPDATE')) return 'bg-purple-900/40 text-purple-400 border-purple-900/50';
    if (action.includes('REJECT') || action.includes('DELETE')) return 'bg-red-900/40 text-red-400 border-red-900/50';
    if (action.includes('CREATE')) return 'bg-emerald-900/40 text-emerald-400 border-emerald-900/50';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  if (error) {
    return (
      <div className="mx-auto h-full w-full max-w-6xl overflow-y-auto p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center">
          <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Access Restricted</h2>
          <p className="text-slate-400 max-w-md mx-auto">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto pb-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="text-purple-500" />
            Audit Trail
          </h1>
          <p className="text-sm text-slate-400 mt-1">Recorded system and human actions across AegisGrid.</p>
        </div>
      </div>

      <div className="grid flex-none grid-cols-1 gap-5 min-[1350px]:min-h-0 min-[1350px]:flex-1 min-[1350px]:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] xl:gap-6">
        
        {/* MAIN LIST */}
        <div className="flex min-h-[500px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg min-[1350px]:min-h-0">
          
          {/* Filters Bar */}
          <div className="bg-slate-950 p-4 border-b border-slate-800">
            <form onSubmit={handleApplyFilters} className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Actor ID</label>
                <input 
                  type="text" 
                  value={filters.actor_id} 
                  onChange={e => setFilters({...filters, actor_id: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. usr-123"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Action</label>
                <input 
                  type="text" 
                  value={filters.action} 
                  onChange={e => setFilters({...filters, action: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. DECISION_ACCEPT"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Entity Type</label>
                <input 
                  type="text" 
                  value={filters.entity_type} 
                  onChange={e => setFilters({...filters, entity_type: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Decision"
                />
              </div>
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Entity ID</label>
                <input 
                  type="text" 
                  value={filters.entity_id} 
                  onChange={e => setFilters({...filters, entity_id: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. dec-123"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
                  <Search size={14} /> Filter
                </button>
                {(activeFilters.action || activeFilters.actor_id || activeFilters.entity_id || activeFilters.entity_type) && (
                  <button type="button" onClick={handleClearFilters} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 flex-1 sm:flex-none justify-center">
                    <X size={14} /> Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-slate-400 flex flex-col items-center gap-3">
                  <Activity className="animate-spin text-purple-500" size={32} />
                  <span className="text-sm font-medium">Retrieving audit logs...</span>
                </div>
              </div>
            ) : data && data.data.length > 0 ? (
              <table className="w-full min-w-[680px] table-fixed border-collapse text-left">
                <colgroup>
                  <col className="w-[26%]" />
                  <col className="w-[25%]" />
                  <col className="w-[21%]" />
                  <col className="w-[28%]" />
                </colgroup>
                <thead className="sticky top-0 bg-slate-950 shadow-md">
                  <tr>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">Timestamp</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">Action</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">Actor</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">Target Entity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data.data.map((log) => (
                    <tr 
                      key={log.id} 
                      onClick={() => setSelectedRecord(log)}
                      className={`cursor-pointer transition-colors ${selectedRecord?.id === log.id ? 'bg-purple-900/20 hover:bg-purple-900/30' : 'hover:bg-slate-800/50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-start gap-2">
                          <Clock size={12} className="shrink-0 text-slate-500" />
                          <span className="min-w-0 break-words text-xs font-mono leading-5 text-slate-300" title={new Date(log.created_at).toLocaleString()}>{formatDate(log.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span title={log.action} className={`inline-flex max-w-full break-all rounded border px-2 py-0.5 text-[10px] font-bold leading-4 tracking-wider ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <User size={12} className="text-slate-500" />
                          <span className="text-sm text-slate-300 font-mono truncate max-w-[120px]" title={log.actor_id}>{log.actor_id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Box size={12} className="text-slate-500" />
                          <span className="text-sm text-slate-400">{log.entity_type}</span>
                          <span className="text-slate-600 text-xs mx-0.5">/</span>
                          <span className="min-w-0 break-all text-xs font-mono text-slate-300" title={log.entity_id}>{log.entity_id}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
                <FileText className="text-slate-600 mb-3" size={36} />
                <h3 className="text-slate-300 font-medium">No audit records found</h3>
                <p className="text-slate-500 text-sm mt-1">
                  {Object.keys(activeFilters).length > 0 
                    ? 'The current filters produced no results. Try clearing them.' 
                    : 'No records exist in the system yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="bg-slate-950 p-4 border-t border-slate-800 flex items-center justify-between text-sm">
            <div className="text-slate-400">
              {data ? (
                <>
                  Showing <span className="text-slate-200 font-medium">{data.data.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span className="text-slate-200 font-medium">{Math.min(page * pageSize, data.meta.total)}</span> of <span className="text-slate-200 font-medium">{data.meta.total}</span> records
                </>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                disabled={loading || page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-slate-400 px-2 font-medium">
                Page {page} of {data?.meta.total_pages || 1}
              </span>
              <button 
                disabled={loading || !data || page >= data.meta.total_pages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS SIDEBAR */}
        <div className="flex h-[480px] min-w-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg min-[1350px]:h-auto">
          <div className="bg-slate-950 px-5 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Record Details</h2>
          </div>
          
          <div className="flex-1 overflow-auto p-5">
            {selectedRecord ? (
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Action</div>
                  <div className={`inline-flex px-2 py-1 rounded text-xs font-bold tracking-wider border ${getActionBadge(selectedRecord.action)}`}>
                    {selectedRecord.action}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Actor ID</div>
                    <div className="text-sm text-slate-300 font-mono break-all bg-slate-950 p-2 rounded border border-slate-800/50">
                      {selectedRecord.actor_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Timestamp</div>
                    <div className="text-sm text-slate-300 font-mono break-all bg-slate-950 p-2 rounded border border-slate-800/50">
                      {formatDate(selectedRecord.created_at)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Target Entity</div>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center gap-3">
                    <div className="bg-slate-900 p-2 rounded border border-slate-700">
                      <Box size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">{selectedRecord.entity_type}</div>
                      <div className="text-sm font-mono text-slate-200 mt-0.5">{selectedRecord.entity_id}</div>
                    </div>
                  </div>
                </div>

                {/* Specific formatting for decision traceability if detected */}
                {selectedRecord.entity_type === 'Decision' && selectedRecord.after_state && typeof selectedRecord.after_state === 'object' && (
                  <div className="mt-6">
                    <div className="bg-[#2D1B4E]/30 border border-[#4C2889]/50 rounded-lg p-4 space-y-4">
                      {/* @ts-ignore */}
                      {selectedRecord.after_state.selected_response_id && (
                        <div>
                          <div className="text-[11px] text-[#91A4BF] mb-1">Selected Response Candidate ID</div>
                          {/* @ts-ignore */}
                          <div className="text-sm font-mono text-[#E6EDF7] font-semibold">{selectedRecord.after_state.selected_response_id}</div>
                        </div>
                      )}
                      {/* @ts-ignore */}
                      {selectedRecord.after_state.reason && (
                        <div>
                          <div className="text-[11px] text-[#91A4BF] mb-1">Rationale</div>
                          {/* @ts-ignore */}
                          <div className="text-sm text-[#E6EDF7] italic">"{selectedRecord.after_state.reason}"</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Human-readable state summaries */}
                {selectedRecord.before_state && Object.keys(selectedRecord.before_state).length > 0 && (
                  <div className="mt-6">
                    <div className="text-[10px] text-[#657994] font-bold uppercase tracking-wider mb-2">
                      BEFORE STATE
                    </div>
                    <ObjectSummary data={selectedRecord.before_state} />
                  </div>
                )}

                {selectedRecord.entity_type !== 'Decision' && selectedRecord.after_state && Object.keys(selectedRecord.after_state).length > 0 && (
                  <div className="mt-6">
                    <div className="text-[10px] text-[#657994] font-bold uppercase tracking-wider mb-2">
                      AFTER STATE
                    </div>
                    <ObjectSummary data={selectedRecord.after_state} />
                  </div>
                )}

                {selectedRecord.metadata && Object.keys(selectedRecord.metadata).length > 0 && (
                  <div className="mt-6">
                    <div className="text-[10px] text-[#657994] font-bold uppercase tracking-wider mb-2">
                      METADATA
                    </div>
                    <ObjectSummary data={selectedRecord.metadata} />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <FileText className="text-slate-700 mb-3" size={40} />
                <h3 className="text-slate-400 font-medium">No Record Selected</h3>
                <p className="text-slate-500 text-sm mt-1">Select an audit log entry from the list to view detailed state transitions and metadata.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function ObjectSummary({ data }: { data: Record<string, unknown> }) {
  return <div className="divide-y divide-[#1E304D] overflow-hidden rounded-lg border border-[#1E304D] bg-[#060B18]">{Object.entries(data).map(([key, value]) => <div key={key} className="grid min-w-0 grid-cols-[minmax(110px,0.8fr)_minmax(0,1.2fr)] gap-3 px-4 py-3"><div className="break-words text-[10px] font-bold uppercase tracking-wider text-[#657994]">{humanizeKey(key)}</div><SummaryValue value={value} /></div>)}</div>;
}

function SummaryValue({ value }: { value: unknown }) {
  if (Array.isArray(value)) return <div className="flex min-w-0 flex-wrap gap-1.5">{value.map((item, index) => <span key={`${String(item)}-${index}`} className="max-w-full break-all rounded border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[11px] text-slate-300">{String(item)}</span>)}</div>;
  if (value && typeof value === 'object') return <div className="min-w-0 space-y-1">{Object.entries(value as Record<string, unknown>).map(([key, nested]) => <div key={key} className="flex min-w-0 flex-wrap gap-x-2 text-[11px]"><span className="text-slate-500">{humanizeKey(key)}:</span><span className="break-all font-mono text-slate-300">{String(nested)}</span></div>)}</div>;
  return <div className="min-w-0 break-words font-mono text-xs text-slate-300">{value === null || value === undefined ? 'Not recorded' : typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}</div>;
}

function humanizeKey(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, character => character.toUpperCase());
}
