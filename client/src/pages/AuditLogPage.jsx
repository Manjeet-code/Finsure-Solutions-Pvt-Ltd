import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Search, Filter, Clock, User, 
  FileText, ArrowRight, RefreshCcw, CheckCircle2, AlertTriangle, Building2, ChevronLeft, ChevronRight 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [actionFilter, setActionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAuditLogs(currentPage);
  }, [currentPage, actionFilter, roleFilter]);

  const fetchAuditLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 20,
        action: actionFilter,
        role: roleFilter,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const res = await api.get(`/audit-logs?${params.toString()}`);
      const data = res.data?.data || res.data;
      setLogs(data.logs || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAuditLogs(1);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'LOAN_DISBURSED':
      case 'LOAN_APPROVED':
      case 'SANCTION_ACCEPTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">{action.replace(/_/g, ' ')}</span>;
      case 'LOAN_REJECTED':
      case 'MANAGER_FIRED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200">{action.replace(/_/g, ' ')}</span>;
      case 'BRANCH_REASSIGNED':
      case 'DOCS_REQUESTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-200">{action.replace(/_/g, ' ')}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-100 text-slate-800 border border-slate-200">{action.replace(/_/g, ' ')}</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-800 bg-slate-200 px-2.5 py-0.5 rounded-full">
              Phase 12 Auditability Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <ShieldAlert className="text-blue-600" size={24} /> System Audit Trail & Security Logs
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Immutable chronological record of all system events, status transitions, manual reassignments, and risk decisions.
          </p>
        </div>

        <Button onClick={() => fetchAuditLogs(currentPage)} variant="outline" className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
          <RefreshCcw size={14} /> Refresh Logs
        </Button>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900 text-white space-y-1 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total System Events</span>
          <div className="text-2xl font-black">{pagination.total || 0}</div>
          <div className="text-[11px] text-slate-400">Recorded Audit Entries</div>
        </Card>

        <Card className="p-4 bg-emerald-50 border-emerald-200 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Page View Scope</span>
          <div className="text-2xl font-black text-emerald-900">Page {pagination.page} / {pagination.pages}</div>
          <div className="text-[11px] text-emerald-700">Displaying 20 entries per page</div>
        </Card>

        <Card className="p-4 bg-blue-50 border-blue-200 space-y-1 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Security Mode</span>
          <div className="text-2xl font-black text-blue-900">AES-256 Encrypted</div>
          <div className="text-[11px] text-blue-700">Strict RBAC & Sanitized Audit Stream</div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 space-y-3 bg-slate-50 border-slate-200">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by User, Action, or Remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={14} className="text-slate-400 shrink-0" />
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 w-full md:w-auto cursor-pointer"
            >
              <option value="ALL">All Event Types</option>
              <option value="APPLICATION_SUBMITTED">Application Submitted</option>
              <option value="DOCS_REQUESTED">Docs Requested</option>
              <option value="DOCUMENT_VERIFIED">Document Verified</option>
              <option value="LOAN_APPROVED">Loan Approved</option>
              <option value="LOAN_REJECTED">Loan Rejected</option>
              <option value="SANCTION_ACCEPTED">Sanction Accepted</option>
              <option value="LOAN_DISBURSED">Loan Disbursed</option>
              <option value="BRANCH_REASSIGNED">Branch Reassigned</option>
              <option value="MANAGER_FIRED">Manager Fired</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <User size={14} className="text-slate-400 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 w-full md:w-auto cursor-pointer"
            >
              <option value="ALL">All User Roles</option>
              <option value="Admin">Admin</option>
              <option value="Branch Manager">Branch Manager</option>
              <option value="Citizen">Citizen</option>
            </select>
          </div>

        </form>
      </Card>

      {/* Audit Stream Table */}
      <Card padding={false} className="overflow-hidden border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Timestamp</th>
                <th className="px-6 py-3.5">Event Action</th>
                <th className="px-6 py-3.5">Performed By</th>
                <th className="px-6 py-3.5">Target Application</th>
                <th className="px-6 py-3.5">Status Shift</th>
                <th className="px-6 py-3.5">Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">Loading master audit trail stream...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 italic">No audit log records match your filter parameters.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-500 text-[11px] text-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{log.performedByName || log.performedBy?.name || 'System User'}</div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {log.performedByRole || log.performedBy?.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.applicationId ? (
                        <div>
                          <div className="font-extrabold text-blue-600 font-mono">{log.applicationId.applicationId}</div>
                          <div className="text-[11px] text-slate-500">
                            {log.applicationId.applicantDetails?.fullName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">System Scope</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <span className="text-slate-400">{log.previousStatus || 'INIT'}</span>
                        <ArrowRight size={12} className="text-slate-400" />
                        <span className="text-slate-900 font-bold">{log.newStatus || log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium max-w-xs truncate">
                      {log.remarks || 'No additional remarks.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-600">
              Showing page {pagination.page} of {pagination.pages} ({pagination.total} total events)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage >= pagination.pages}
                onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                className="text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
};

export default AuditLogPage;
