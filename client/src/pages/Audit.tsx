import { useState, useEffect } from 'react';
import type { AuditLog, PaginatedResult, AuditFilters } from '../features/audit/api/audit.api';
import { AuditApi } from '../features/audit/api/audit.api';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from 'shared';
import { ShieldAlert, Search, X, ChevronLeft, ChevronRight, Activity, Clock, User, Box, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

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
      return new Date(dateString).toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
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
      <div className="h-full p-6 max-w-6xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl text-center">
          <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-slate-100 mb-2">Access Restricted</h2>
          <p className="text-slate-400 max-w-md mx-auto">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto pb-12">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="text-purple-500" />
            Audit Trail
          </h1>
          <p className="text-sm text-slate-400 mt-1">Recorded system and human actions across AegisGrid.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* MAIN LIST */}
        <div className="lg:col-span-2 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          
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
              <table className="w-full text-left border-collapse">
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
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-slate-500" />
                          <span className="text-sm text-slate-300 font-mono">{formatDate(log.created_at)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-slate-500" />
                          <span className="text-sm text-slate-300 font-mono truncate max-w-[120px]" title={log.actor_id}>{log.actor_id}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Box size={12} className="text-slate-500" />
                          <span className="text-sm text-slate-400">{log.entity_type}</span>
                          <span className="text-slate-600 text-xs mx-0.5">/</span>
                          <span className="text-xs text-slate-300 font-mono truncate max-w-[100px]" title={log.entity_id}>{log.entity_id.split('-')[0]}</span>
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[600px] lg:h-auto">
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
                  <div className="border-t border-slate-800 pt-5 mt-5">
                    <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ArrowRight size={12} /> Decision Traceability
                    </div>
                    <div className="bg-purple-950/20 border border-purple-900/30 rounded-lg p-3 space-y-3">
                      {/* @ts-ignore */}
                      {selectedRecord.after_state.decision_type && (
                        <div>
                          <div className="text-xs text-slate-500">Decision Type</div>
                          {/* @ts-ignore */}
                          <div className="text-sm font-semibold text-slate-200">{selectedRecord.after_state.decision_type}</div>
                        </div>
                      )}
                      {/* @ts-ignore */}
                      {selectedRecord.after_state.selected_response_id && (
                        <div>
                          <div className="text-xs text-slate-500">Selected Response Candidate ID</div>
                          {/* @ts-ignore */}
                          <div className="text-sm font-mono text-slate-300">{selectedRecord.after_state.selected_response_id}</div>
                        </div>
                      )}
                      {/* @ts-ignore */}
                      {selectedRecord.after_state.reason && (
                        <div>
                          <div className="text-xs text-slate-500">Rationale</div>
                          {/* @ts-ignore */}
                          <div className="text-sm text-slate-300 italic">"{selectedRecord.after_state.reason}"</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Raw States */}
                {selectedRecord.before_state && Object.keys(selectedRecord.before_state).length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Before State</span>
                    </div>
                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 max-h-48 overflow-auto">
                      <pre className="text-xs font-mono text-slate-400">
                        {JSON.stringify(selectedRecord.before_state, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedRecord.after_state && Object.keys(selectedRecord.after_state).length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>After State</span>
                    </div>
                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 max-h-48 overflow-auto">
                      <pre className="text-xs font-mono text-slate-400">
                        {JSON.stringify(selectedRecord.after_state, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedRecord.metadata && Object.keys(selectedRecord.metadata).length > 0 && (
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Metadata</div>
                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-auto">
                      <pre className="text-xs font-mono text-slate-400">
                        {JSON.stringify(selectedRecord.metadata, null, 2)}
                      </pre>
                    </div>
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
