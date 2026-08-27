import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, FileText, CheckCircle2, XCircle, ArrowLeft, User, 
  Landmark, AlertCircle, Eye, Check, X, FileCheck, Building2, RefreshCw, History, Edit3, Banknote, CreditCard
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import api from '../lib/axios';

const DocumentVerification = () => {
  const [searchParams] = useSearchParams();
  const appIdParam = searchParams.get('appId');

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Decision Form state
  const [remarks, setRemarks] = useState('');
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [approvedTenureMonths, setApprovedTenureMonths] = useState(0);
  
  // Re-upload Request Modal state
  const [reuploadDocType, setReuploadDocType] = useState(null);
  const [reuploadRemarks, setReuploadRemarks] = useState('');

  // Phase 8 Disbursal Modal state
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disbursementRefNumber, setDisbursementRefNumber] = useState('');
  const [disburseLoading, setDisburseLoading] = useState(false);

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBranchApplications();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      setApprovedAmount(selectedApp.approvedAmount || selectedApp.amount || 0);
      setApprovedTenureMonths(selectedApp.approvedTenureMonths || selectedApp.tenureMonths || 0);
      setRemarks(selectedApp.remarks || '');
      setDisbursementRefNumber(selectedApp.disbursementRefNumber || `NEFT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`);
      fetchAuditTrail(selectedApp._id);
    }
  }, [selectedApp?._id]);

  const fetchBranchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loans/branch-queue');
      const appList = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setApplications(appList);

      if (appIdParam) {
        const found = appList.find((a) => a._id === appIdParam);
        if (found) setSelectedApp(found);
        else if (appList.length > 0) setSelectedApp(appList[0]);
      } else if (appList.length > 0) {
        setSelectedApp(appList[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load application queue');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditTrail = async (appId) => {
    try {
      const res = await api.get(`/loans/${appId}/audit-trail`);
      setAuditLogs(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    }
  };

  const handleVerifyDocument = async (documentType, status) => {
    if (!selectedApp) return;
    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.post(`/loans/${selectedApp._id}/verify-doc`, {
        documentType,
        status,
        remarks: `Document ${documentType} marked as ${status} by Branch Manager.`,
      });

      const updatedApp = res.data?.data || res.data;
      setSelectedApp(updatedApp);
      setApplications((prev) => prev.map((a) => (a._id === updatedApp._id ? updatedApp : a)));
      setMessage(`Document ${documentType} successfully marked as ${status}.`);
      fetchAuditTrail(selectedApp._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update document status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReupload = async () => {
    if (!selectedApp || !reuploadDocType || !reuploadRemarks.trim()) return;
    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.post(`/loans/${selectedApp._id}/request-reupload`, {
        documentType: reuploadDocType,
        remarks: reuploadRemarks,
      });

      const updatedApp = res.data?.data || res.data;
      setSelectedApp(updatedApp);
      setApplications((prev) => prev.map((a) => (a._id === updatedApp._id ? updatedApp : a)));
      setMessage(`Re-upload request sent to applicant for ${reuploadDocType}. Status set to DOCS_REQUESTED.`);
      setReuploadDocType(null);
      setReuploadRemarks('');
      fetchAuditTrail(selectedApp._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request document re-upload');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecision = async (decision) => {
    if (!selectedApp) return;
    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.post(`/loans/${selectedApp._id}/decide`, {
        decision,
        remarks: remarks || `Loan application ${decision} by Branch Manager.`,
        approvedAmount: Number(approvedAmount),
        approvedTenureMonths: Number(approvedTenureMonths),
      });

      const updatedApp = res.data?.data || res.data;
      setSelectedApp(updatedApp);
      setApplications((prev) => prev.map((a) => (a._id === updatedApp._id ? updatedApp : a)));
      setMessage(`Loan Application ${selectedApp.applicationId} status updated to ${decision.toUpperCase()}! Sanction Letter Ref: ${updatedApp.sanctionRefNumber}`);
      fetchAuditTrail(selectedApp._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application decision');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteDisbursal = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    setDisburseLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.post(`/loans/${selectedApp._id}/disburse`, {
        disbursementRefNumber,
        remarks: `Loan funds disbursed by Branch Manager under Ref ${disbursementRefNumber}`,
      });

      const updatedApp = res.data?.data || res.data;
      setSelectedApp(updatedApp);
      setApplications((prev) => prev.map((a) => (a._id === updatedApp._id ? updatedApp : a)));
      setMessage(`Loan Application ${selectedApp.applicationId} DISBURSED under Ref ${updatedApp.disbursementRefNumber}!`);
      setShowDisburseModal(false);
      fetchAuditTrail(selectedApp._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute loan disbursal');
    } finally {
      setDisburseLoading(false);
    }
  };

  if (loading) {
    return <Card className="p-12 text-center text-slate-500">Loading document verification workspace...</Card>;
  }

  const isApproved = ['Approved', 'SANCTIONED', 'Disbursed'].includes(selectedApp?.status);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Document Verification & Decision Engine</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Inspect KYC documents, request re-uploads, customize approved amounts, and execute loan disbursals.
          </p>
        </div>
        <Link to="/applications">
          <Button variant="outline" className="text-xs font-bold flex items-center gap-1.5">
            <ArrowLeft size={16} /> Back to Queue
          </Button>
        </Link>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={18} className="text-red-600 shrink-0" /> {error}
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Applications Queue */}
        <Card className="p-4 space-y-3 lg:col-span-1 border-slate-200">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
            Select Application ({applications.length})
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {applications.map((app) => (
              <div
                key={app._id}
                onClick={() => {
                  setSelectedApp(app);
                  setMessage(null);
                  setError(null);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  selectedApp?._id === app._id
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 text-xs">{app.applicationId}</span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    app.status === 'Disbursed' ? 'bg-emerald-600 text-white' :
                    app.status === 'Approved' || app.status === 'SANCTIONED' ? 'bg-emerald-100 text-emerald-800' :
                    app.status === 'DOCS_REQUESTED' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    app.status === 'Verified' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {app.status === 'DOCS_REQUESTED' ? 'Docs Requested' : app.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-800">{app.applicantDetails?.fullName}</div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Req: ₹{Number(app.amount).toLocaleString('en-IN')}</span>
                  <span>{app.applicantDetails?.pincode}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Active Workspace */}
        {selectedApp && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <Card className="p-6 space-y-4 border-slate-200 bg-gradient-to-br from-white to-blue-50/30">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
                    {selectedApp.loanProductId?.productCode || 'SCHEME'}
                  </span>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                    {selectedApp.loanProductId?.name || 'Loan Scheme'} — {selectedApp.applicationId}
                  </h2>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block">Approved / Sanctioned Amount</span>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <span className="text-2xl font-black text-blue-700">₹{Number(selectedApp.approvedAmount || selectedApp.amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Applicant Financial Profile */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Applicant Name:</span>
                  <span className="font-bold text-slate-900">{selectedApp.applicantDetails?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Monthly Income:</span>
                  <span className="font-bold text-slate-900">₹{Number(selectedApp.applicantDetails?.monthlyIncome).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Employment Type:</span>
                  <span className="font-bold text-slate-900">{selectedApp.applicantDetails?.employmentType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location / Pincode:</span>
                  <span className="font-bold text-slate-900">{selectedApp.applicantDetails?.city} ({selectedApp.applicantDetails?.pincode})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">PAN / Aadhaar:</span>
                  <span className="font-bold font-mono text-slate-900">{selectedApp.applicantDetails?.panNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Assigned Branch:</span>
                  <span className="font-bold text-blue-700">{selectedApp.branchId?.branchName || 'Lucknow Branch'}</span>
                </div>
              </div>
            </Card>

            {/* Document Checklist & Verification */}
            <Card className="p-6 space-y-4 border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileCheck size={18} className="text-blue-600" /> KYC Document Verification Checklist
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  {selectedApp.uploadedDocuments?.filter(d => d.status === 'VERIFIED').length || 0} / {selectedApp.uploadedDocuments?.length || 0} Verified
                </span>
              </h3>

              {selectedApp.uploadedDocuments?.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic">No KYC documents uploaded.</div>
              ) : (
                <div className="space-y-3">
                  {selectedApp.uploadedDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        doc.status === 'VERIFIED'
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : doc.status === 'REJECTED'
                          ? 'bg-red-50/70 border-red-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                          doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{doc.documentType.replace('_', ' ')}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                              doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{doc.originalName || 'Document file'}</p>
                          {doc.remarks && <p className="text-[11px] text-red-600 italic mt-0.5">Note: {doc.remarks}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <a
                          href={`http://localhost:5000${doc.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-white text-blue-700 hover:bg-blue-50 border border-slate-300 font-bold text-xs rounded-lg shadow-2xs"
                        >
                          View
                        </a>

                        <button
                          onClick={() => handleVerifyDocument(doc.documentType, 'VERIFIED')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Check size={14} /> Verify
                        </button>

                        <button
                          onClick={() => setReuploadDocType(doc.documentType)}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <RefreshCw size={14} /> Request Re-upload
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Re-upload Request Drawer/Input */}
            {reuploadDocType && (
              <Card className="p-5 border-amber-300 bg-amber-50/70 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <RefreshCw size={14} /> Request Re-upload for {reuploadDocType.replace('_', ' ')}
                  </h4>
                  <button onClick={() => setReuploadDocType(null)} className="text-amber-700 text-xs font-bold hover:underline">Cancel</button>
                </div>
                <input
                  type="text"
                  placeholder="Specify why re-upload is needed (e.g., File is blurry, expired document, wrong file)..."
                  value={reuploadRemarks}
                  onChange={(e) => setReuploadRemarks(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500"
                />
                <Button onClick={handleRequestReupload} disabled={actionLoading} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs w-full">
                  Send Re-upload Request to Citizen
                </Button>
              </Card>
            )}

            {/* Phase 8 Loan Disbursal Control Banner */}
            {isApproved && selectedApp.status !== 'Disbursed' && (
              <Card className="p-5 border-emerald-300 bg-emerald-50/80 space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="font-black text-emerald-950 text-base flex items-center gap-2">
                      <Banknote size={20} className="text-emerald-700" /> Execute Phase 8 Loan Disbursal
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium mt-0.5">
                      Sanction Ref: <strong className="text-emerald-950 font-mono">{selectedApp.sanctionRefNumber || 'SNC-2026-4019'}</strong> | Approved Amount: <strong className="text-emerald-950">₹{Number(selectedApp.approvedAmount || selectedApp.amount).toLocaleString('en-IN')}</strong>
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowDisburseModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0 cursor-pointer"
                  >
                    <Banknote size={16} /> Execute Disbursal Now
                  </Button>
                </div>
              </Card>
            )}

            {/* Sanction Customization & Decision Controls */}
            <Card className="p-6 space-y-4 border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-3 flex items-center gap-2">
                <Edit3 size={18} className="text-blue-600" /> Sanction Customization & Decision Controls
              </h3>

              {/* Sanction Override Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sanctioned Loan Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">Requested: ₹{Number(selectedApp.amount).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sanctioned Tenure (Months)
                  </label>
                  <input
                    type="number"
                    value={approvedTenureMonths}
                    onChange={(e) => setApprovedTenureMonths(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">Requested: {selectedApp.tenureMonths} Months</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Manager Decision Remarks
                </label>
                <textarea
                  rows="2"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter assessment remarks, credit decision notes, or approval remarks..."
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button
                  onClick={() => handleDecision('Rejected')}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <XCircle size={16} /> Reject Application
                </Button>
                <Button
                  onClick={() => handleDecision('Approved')}
                  disabled={actionLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={16} /> Approve Loan & Generate Sanction
                </Button>
              </div>
            </Card>

            {/* Audit Trail History */}
            <Card className="p-6 space-y-4 border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <History size={18} className="text-slate-600" /> Workflow Audit Trail History
              </h3>
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No audit events recorded yet.</p>
              ) : (
                <div className="space-y-2 text-xs">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{log.action.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">{log.performedByRole}</span>
                        </div>
                        <p className="text-slate-600 text-xs mt-0.5">{log.remarks}</p>
                        <span className="text-[10px] text-slate-400 block mt-0.5">By: {log.performedByName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>
        )}

      </div>

      {/* Disbursal Execution Modal */}
      {showDisburseModal && selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-emerald-100 shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Banknote className="text-emerald-600" size={22} /> Execute Loan Disbursal
                </h3>
                <p className="text-xs text-slate-500 font-medium">App ID: {selectedApp.applicationId} | Sanction Ref: {selectedApp.sanctionRefNumber}</p>
              </div>
              <button onClick={() => setShowDisburseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-xs">
              <div className="font-bold text-emerald-950 text-sm">{selectedApp.applicantDetails?.fullName}</div>
              <div className="text-emerald-800">
                Disbursal Amount: <strong className="text-emerald-950 font-mono text-base">₹{Number(selectedApp.approvedAmount || selectedApp.amount).toLocaleString('en-IN')}</strong>
              </div>
              {selectedApp.disbursementAccountDetails && (
                <div className="text-[11px] text-emerald-700 font-mono mt-1 pt-1 border-t border-emerald-200">
                  Target A/C: {selectedApp.disbursementAccountDetails.bankName} - {selectedApp.disbursementAccountDetails.accountNumber} ({selectedApp.disbursementAccountDetails.ifscCode})
                </div>
              )}
            </div>

            <form onSubmit={handleExecuteDisbursal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Disbursement Transaction Reference / NEFT ID *
                </label>
                <input
                  type="text"
                  required
                  value={disbursementRefNumber}
                  onChange={(e) => setDisbursementRefNumber(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold uppercase focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowDisburseModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={disburseLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {disburseLoading ? 'Executing Transfer...' : 'Confirm Loan Disbursal'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentVerification;
