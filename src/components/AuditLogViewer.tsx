import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Clock, User, Download, ChevronDown, ChevronUp } from 'lucide-react';
import * as auditLogService from '../services/auditLogService';

interface AuditLogViewerProps {
  logs?: auditLogService.AuditLogEntry[];
}

export function AuditLogViewer({ logs: propLogs }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<auditLogService.AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const toggleExpand = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  useEffect(() => {
    // If propLogs provided, use it, otherwise load from service
    if (propLogs) {
      setLogs(propLogs);
      setLoading(false);
    } else {
      loadLogs();
    }
  }, [propLogs]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = auditLogService.getLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) || 
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'ALL') return matchesSearch;
    return matchesSearch && log.entityType === filterType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search activity logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <select 
             value={filterType}
             onChange={(e) => setFilterType(e.target.value)}
             className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none"
           >
             <option value="ALL">All Actions</option>
             <option value="ORDER">Orders</option>
             <option value="PRODUCT">Products</option>
             <option value="VENDOR">Vendors</option>
             <option value="BUYER">Buyers</option>
             <option value="EXPENSE">Expenses</option>
           </select>
           <button 
             onClick={() => {
                 const csvContent = "data:text/csv;charset=utf-8," + 
                    ["Timestamp,Action,Entity,ID,Details"].join(",") + "\n" +
                    filteredLogs.map(l => 
                        `${l.timestamp},${l.action},${l.entityType},${l.entityId},"${l.details}"`
                    ).join("\n");
                 const encodedUri = encodeURI(csvContent);
                 const link = document.createElement("a");
                 link.setAttribute("href", encodedUri);
                 link.setAttribute("download", "audit_logs.csv");
                 document.body.appendChild(link);
                 link.click();
                 document.body.removeChild(link);
             }}
             className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100"
           >
             <Download className="w-4 h-4" />
             Export
           </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Entity Type</th>
                <th className="px-6 py-3">Details</th>
                <th className="px-6 py-3 text-right">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                     <div className="flex justify-center items-center gap-2">
                       <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                       Loading logs...
                     </div>
                   </td>
                 </tr>
              ) : filteredLogs.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                     No activity logs found.
                   </td>
                 </tr>
              ) : (
                filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700' :
                          log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700' :
                          log.action === 'DELETE' || log.action === 'SOFT_DELETE' ? 'bg-rose-50 text-rose-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {log.entityType}
                        <span className="text-xs text-gray-400 font-mono ml-2">#{log.entityId}</span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 max-w-md truncate" title={log.details}>
                            {log.details}
                          </span>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <button
                              onClick={() => toggleExpand(log.id)}
                              className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Show details"
                            >
                              {expandedLogs.has(log.id) ? (
                                <ChevronUp className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right text-gray-500 font-medium">
                        <div className="flex items-center justify-end gap-1">
                          <User className="w-3 h-3" />
                          {log.performedBy}
                        </div>
                      </td>
                    </tr>
                    {expandedLogs.has(log.id) && log.metadata && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="rounded-lg bg-white border border-gray-200 p-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Filter className="w-4 h-4 text-indigo-600" />
                              Additional Details
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(log.metadata).map(([key, value]) => (
                                <div key={key} className="flex gap-3 text-sm">
                                  <span className="text-gray-600 font-medium min-w-[120px]">{key}:</span>
                                  <span className="text-gray-900 font-mono text-xs">
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}