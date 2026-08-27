import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FolderCheck, FileText, CheckCircle2, AlertCircle, Eye, ShieldCheck, 
  Landmark, Search, Filter, RefreshCcw, Building2, X 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';
import { useAuth } from '../contexts/AuthContext';

const ReviewQueue = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterBranchId, setFilterBranchId] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Reassign Modal state
  const [reassignApp, setReassignApp] = useState(null);
  const [targetBranchId, setTargetBranchId] = useState('');
  const [reassignLoading, setReassignLoading] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
    fetchBranches();
  }, []);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loans/branch-queue');
      const appList = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setApplications(appList);
    } catch (err) {
      console.error('Failed to fetch review queue:', err);
      setError('Failed to load branch review queue');
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to fetch branches:', err);
    }
  };

  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!reassignApp || !targetBranchId) return;
    setReassignLoading(true);
    setError(null);
    setMessage(null);

    try {
      await api.post(`/loans/${reassignApp._id}/reassign-branch`, {
        branchId: targetBranchId,
        remarks: `Application manually reassigned by Admin`,
      });

      setMessage(`Application ${reassignApp.applicationId} successfully reassigned to new branch.`);
      setReassignApp(null);
      fetchReviewQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reassign application branch');
    } finally {
      setReassignLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
    const matchesBranch =
      filterBranchId === 'ALL' ||
      app.branchId?._id === filterBranchId ||
      app.branchId === filterBranchId;
    const matchesSearch =
      searchQuery === '' ||
      app.applicationId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantDetails?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantDetails?.pincode?.includes(searchQuery) ||
      app.branchId?.branchName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesBranch && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Submitted':
      case 'Pending':
        return <Badge status="PENDING">Pending Review</Badge>;
      case 'DOCS_REQUESTED':
        return <Badge status="PENDING">Docs Requested</Badge>;
      case 'Verified':
        return <Badge status="VERIFIED">KYC Verified</Badge>;
      case 'Approved':
      case 'Disbursed':
        return <Badge status="APPROVED">Approved</Badge>;
      case 'Rejected':
        return <Badge status="REJECTED">Rejected</Badge>;
      default:
        return <Badge status="PENDING">{status}</Badge>;
    }
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Branch Application Review Queue</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Applications auto-routed to regional branches based on pincode mapping. Verify documents & process loan decisions.
          </p>
        </div>

        <Button onClick={fetchReviewQueue} variant="outline" className="text-xs font-bold flex items-center gap-1.5">
          <RefreshCcw size={14} /> Refresh Queue
        </Button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> {message}
        </div>
      )}

      {/* Filter & Search Controls */}
      <Card className="p-4 space-y-3 bg-slate-50 border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, Applicant Name, Pincode, Branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Regional Branch Selector Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Building2 size={16} className="text-blue-600 shrink-0" />
            <select
              value={filterBranchId}
              onChange={(e) => setFilterBranchId(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 w-full md:w-auto cursor-pointer"
            >
              <option value="ALL">All Regional Branches ({branches.length})</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.branchName} ({b.city})
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Workflow Status Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-200 pt-3 overflow-x-auto">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <div className="flex bg-white rounded-xl p-1 border border-slate-200 text-xs font-bold overflow-x-auto">
            {['ALL', 'Submitted', 'DOCS_REQUESTED', 'Verified', 'Approved', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg transition-all text-nowrap cursor-pointer ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st === 'DOCS_REQUESTED' ? 'Docs Requested' : st}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Applications List */}
      {loading ? (
        <Card className="p-12 text-center text-slate-500">Loading branch application queue...</Card>
      ) : error ? (
        <Card className="p-8 text-center text-red-600">{error}</Card>
      ) : filteredApplications.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <FolderCheck size={36} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-800">No Applications Match Filter</h3>
          <p className="text-xs text-slate-500">No applications match your selected status or regional branch filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApplications.map((app) => (
            <Card key={app._id} className="p-6 hover:shadow-md transition-shadow space-y-4 border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-base">{app.applicationId}</span>
                      {getStatusBadge(app.status)}
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white flex items-center gap-1">
                        <Building2 size={11} /> {app.branchId?.branchName || 'Regional Hub'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Applicant: <strong className="text-slate-800">{app.applicantDetails?.fullName || app.citizenId?.name}</strong> ({app.applicantDetails?.phone || app.citizenId?.phone})
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block font-medium">Requested Amount</span>
                  <span className="text-xl font-black text-blue-700">₹{Number(app.amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block">Loan Scheme:</span>
                  <span className="font-bold text-slate-800">{app.loanProductId?.name || 'Loan Scheme'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location & Pincode:</span>
                  <span className="font-bold text-slate-800">{app.applicantDetails?.city || 'N/A'} ({app.applicantDetails?.pincode || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Monthly Income:</span>
                  <span className="font-bold text-slate-800">₹{Number(app.applicantDetails?.monthlyIncome || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Submitted On:</span>
                  <span className="font-bold text-slate-800">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1.5">
                  <Building2 size={14} className="text-blue-600" />
                  Assigned Regional Branch: <strong className="text-slate-900 font-bold">{app.branchId?.branchName || 'Regional Hub'} ({app.branchId?.city || app.applicantDetails?.city})</strong>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button
                      onClick={() => {
                        setReassignApp(app);
                        setTargetBranchId(app.branchId?._id || '');
                      }}
                      variant="outline"
                      className="text-xs font-bold flex items-center gap-1 text-slate-700 cursor-pointer"
                    >
                      <RefreshCcw size={14} /> Admin Reassign
                    </Button>
                  )}

                  <Link to={`/documents?appId=${app._id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                      <ShieldCheck size={16} /> Verify Documents & Process
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Admin Reassign Branch Modal */}
      {reassignApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <Card className="w-full max-w-md p-6 space-y-4 bg-white relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" /> Admin Branch Reassignment
              </h3>
              <button onClick={() => setReassignApp(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Reassign application <strong className="text-slate-900">{reassignApp.applicationId}</strong> ({reassignApp.applicantDetails?.fullName}) to a different regional branch queue.
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target Branch *
                </label>
                <select
                  required
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Target Branch</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.branchName} ({b.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setReassignApp(null)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold" disabled={reassignLoading}>
                  {reassignLoading ? 'Reassigning...' : 'Confirm Reassignment'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
};

export default ReviewQueue;
