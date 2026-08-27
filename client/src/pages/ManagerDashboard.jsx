import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, CheckCircle, XCircle, Clock, Loader, X, UserCheck, 
  ShieldAlert, Download, AlertTriangle, Building2, CheckCircle2, Send, ChevronRight, Eye
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';
import { generateBranchReportPDF } from '../utils/generateBranchReportPDF';

const ManagerDashboard = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [managerRemarks, setManagerRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ACTION CENTER MODAL STATES
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [officerTargetApp, setOfficerTargetApp] = useState('');
  const [officerNotes, setOfficerNotes] = useState('');
  const [officerAssignedSuccess, setOfficerAssignedSuccess] = useState(false);

  const [showAiModal, setShowAiModal] = useState(false);
  const [aiClearedSuccess, setAiClearedSuccess] = useState(false);

  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/loans/branch-queue');
      const appList = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setLoans(appList);
    } catch (error) {
      console.error('Error fetching loans', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleSelectLoan = async (loan) => {
    setSelectedLoan(loan);
    setManagerRemarks(loan.remarks || '');
    setDocuments(loan.uploadedDocuments || []);
  };

  const handleDocStatus = async (documentType, status) => {
    if (!selectedLoan) return;
    try {
      const res = await api.post(`/loans/${selectedLoan._id}/verify-doc`, {
        documentType,
        status,
        remarks: `Document ${documentType} marked as ${status}`,
      });
      const updated = res.data?.data || res.data;
      setSelectedLoan(updated);
      setDocuments(updated.uploadedDocuments || []);
    } catch (error) {
      console.error('Error updating document status', error);
      alert('Failed to update document status');
    }
  };

  const handleUpdateStatus = async (loanId, status) => {
    try {
      setActionLoading(true);
      await api.post(`/loans/${loanId}/decide`, { decision: status, remarks: managerRemarks });
      setSelectedLoan(null);
      fetchLoans();
    } catch (error) {
      console.error('Error updating loan', error);
      alert('Failed to update loan status');
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION 1: Assign Verification Officers Handler
  const handleAssignOfficerSubmit = (e) => {
    e.preventDefault();
    if (!selectedOfficer || !officerTargetApp) return;

    setOfficerAssignedSuccess(true);
    setTimeout(() => {
      setOfficerAssignedSuccess(false);
      setShowOfficerModal(false);
      setSelectedOfficer('');
      setOfficerTargetApp('');
      setOfficerNotes('');
      setSuccessToast(`Verification Officer successfully assigned to application ${officerTargetApp}!`);
      setTimeout(() => setSuccessToast(''), 4000);
    }, 1500);
  };

  // ACTION 2: Review AI Discrepancies Risk Override Handler
  const handleClearAiDiscrepancies = () => {
    setAiClearedSuccess(true);
    setTimeout(() => {
      setAiClearedSuccess(false);
      setShowAiModal(false);
      setSuccessToast('AI Discrepancy flags reviewed & cleared by Branch Manager!');
      setTimeout(() => setSuccessToast(''), 4000);
    }, 1500);
  };

  // ACTION 3: Generate Branch Report PDF Handler
  const handleGenerateBranchReport = async () => {
    setPdfGenerating(true);
    try {
      // Find branch details
      const branchesRes = await api.get('/branches');
      const branchList = branchesRes.data?.data || branchesRes.data || [];
      const currentBranch = branchList[0] || {
        branchName: 'Lucknow Gomti Nagar Branch',
        branchCode: 'BR-LKO-01',
        city: 'Lucknow',
        state: 'UP',
        address: 'Vibhuti Khand, Gomti Nagar, Lucknow, UP',
        pincodeRanges: ['226010', '226012', '226016'],
        managerId: { name: userInfo.name || 'Rohit Mathur', email: userInfo.email || 'branchmanager.lucknow@finsure.in' },
      };

      const branchDetails = {
        todaysApplications: safeLoans.length,
        pendingVerification: pendingCount,
        approvedToday,
        rejectedToday,
        recentApplications: safeLoans.slice(0, 8),
      };

      await generateBranchReportPDF(currentBranch, branchDetails);
      setSuccessToast('Executive Branch PDF Report downloaded successfully!');
      setTimeout(() => setSuccessToast(''), 4000);
    } catch (err) {
      console.error('Failed to generate branch report:', err);
    } finally {
      setPdfGenerating(false);
    }
  };

  // KPIs
  const safeLoans = Array.isArray(loans) ? loans : [];
  const today = new Date().toISOString().split('T')[0];
  const todaysLoans = safeLoans.filter(l => l.createdAt && new Date(l.createdAt).toISOString().split('T')[0] === today);
  
  const pendingCount = safeLoans.filter(l => l.status === 'Pending' || l.status === 'Submitted' || l.status === 'DOCS_REQUESTED').length;
  const approvedToday = safeLoans.filter(l => l.status === 'Approved' || l.status === 'Disbursed' || l.status === 'SANCTIONED').length;
  const rejectedToday = safeLoans.filter(l => l.status === 'Rejected').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce text-xs font-bold">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">FinSure Branch Operations Portal</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Welcome back, <strong>{userInfo.name || 'Branch Manager'}</strong></p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Applications" value={safeLoans.length} icon={<FileText className="text-blue-500" />} />
        <KPICard title="Pending Verification" value={pendingCount} icon={<Clock className="text-amber-500" />} />
        <KPICard title="Approved Today" value={approvedToday} icon={<CheckCircle className="text-emerald-500" />} />
        <KPICard title="Rejected Today" value={rejectedToday} icon={<XCircle className="text-red-500" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-bold mb-4">Applications Pending Verification</h2>
            <div className="space-y-4">
              {safeLoans.filter(l => l.status === 'Pending' || l.status === 'Submitted' || l.status === 'DOCS_REQUESTED').map(loan => (
                <ApplicationRow 
                  key={loan._id}
                  loan={loan}
                  onReview={() => handleSelectLoan(loan)}
                />
              ))}
              {safeLoans.filter(l => l.status === 'Pending' || l.status === 'Submitted' || l.status === 'DOCS_REQUESTED').length === 0 && (
                <p className="text-gray-500 text-center py-4 text-xs italic">No pending applications at the moment.</p>
              )}
            </div>
          </Card>
          
          <Card>
            <h2 className="text-lg font-bold mb-4">Recent Processed Applications</h2>
            <div className="space-y-4 opacity-75">
              {safeLoans.filter(l => l.status !== 'Pending' && l.status !== 'Submitted').slice(0, 5).map(loan => (
                <div key={loan._id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-gray-800 text-xs">{loan.applicantDetails?.fullName || loan.citizenId?.name || 'Applicant'}</p>
                    <p className="text-xs text-gray-500">₹{loan.amount ? Number(loan.amount).toLocaleString('en-IN') : '0'} • {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    loan.status === 'Approved' || loan.status === 'SANCTIONED' || loan.status === 'Disbursed' ? 'bg-emerald-100 text-emerald-800' :
                    loan.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {loan.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white border-none shadow-md">
            <h2 className="text-lg font-bold opacity-90 mb-4">Branch Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm opacity-90 mb-1">
                  <span>Monthly Target</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm opacity-90 mb-1">
                  <span>Document Verification Speed</span>
                  <span>Fast</span>
                </div>
                <p className="text-2xl font-bold">12 hrs <span className="text-sm font-normal opacity-80">avg. turnaround</span></p>
              </div>
            </div>
          </Card>
          
          {/* FUNCTIONAL ACTION CENTER */}
          <Card className="border-indigo-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" /> Action Center
              </h2>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
                Interactive Controls
              </span>
            </div>

            <div className="space-y-2.5">
              <Button
                onClick={() => setShowOfficerModal(true)}
                variant="outline"
                className="w-full justify-between text-xs font-bold hover:bg-indigo-50 border-slate-200 cursor-pointer group py-2.5"
              >
                <span className="flex items-center gap-2 text-slate-800 group-hover:text-indigo-600">
                  <UserCheck size={16} className="text-indigo-600" /> Assign Verification Officers
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Button>

              <Button
                onClick={() => setShowAiModal(true)}
                variant="outline"
                className="w-full justify-between text-xs font-bold hover:bg-amber-50 border-slate-200 cursor-pointer group py-2.5"
              >
                <span className="flex items-center gap-2 text-slate-800 group-hover:text-amber-600">
                  <ShieldAlert size={16} className="text-amber-600" /> Review AI Discrepancies
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Button>

              <Button
                onClick={handleGenerateBranchReport}
                disabled={pdfGenerating}
                variant="outline"
                className="w-full justify-between text-xs font-bold hover:bg-emerald-50 border-slate-200 cursor-pointer group py-2.5"
              >
                <span className="flex items-center gap-2 text-slate-800 group-hover:text-emerald-700">
                  <Download size={16} className="text-emerald-600" /> {pdfGenerating ? 'Generating PDF...' : 'Generate Branch Report'}
                </span>
                <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedLoan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => !actionLoading && setSelectedLoan(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10 border border-slate-200"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Review Application</h2>
                  <p className="text-xs font-mono text-slate-500">ID: {selectedLoan.applicationId || selectedLoan._id}</p>
                </div>
                <button disabled={actionLoading} onClick={() => setSelectedLoan(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-6 overflow-y-auto">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Applicant Name</p>
                    <p className="font-bold text-slate-900 text-sm">{selectedLoan.applicantDetails?.fullName || selectedLoan.citizenId?.name || 'Unknown User'}</p>
                    <p className="text-xs text-slate-500">{selectedLoan.applicantDetails?.phone || selectedLoan.citizenId?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Loan Product</p>
                    <p className="font-bold text-slate-900 text-sm">{selectedLoan.loanProductId?.name || 'Standard Loan'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Amount Requested</p>
                    <p className="font-black text-blue-600 text-lg">₹{selectedLoan.amount ? Number(selectedLoan.amount).toLocaleString('en-IN') : '0'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Tenure</p>
                    <p className="font-bold text-slate-900 text-sm">{selectedLoan.tenureMonths} Months</p>
                  </div>
                </div>

                <div className="bg-blue-50/70 border border-blue-100 p-3.5 rounded-xl">
                  <p className="text-xs text-blue-800 font-bold mb-1">Purpose of Loan</p>
                  <p className="text-blue-950 text-sm">{selectedLoan.purpose || 'Not specified'}</p>
                </div>

                {/* Uploaded Documents Inspection Section */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Uploaded Documents Verification</h3>
                  {docsLoading ? (
                    <div className="py-4 text-center"><Loader className="animate-spin mx-auto text-blue-600" size={24} /></div>
                  ) : documents.length > 0 ? (
                    <div className="space-y-2.5">
                      {documents.map((doc, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{doc.documentType?.replace('_', ' ')}</p>
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                              <Eye size={12} /> View File Document
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDocStatus(doc.documentType, 'VERIFIED')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                doc.status === 'VERIFIED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800'
                              }`}
                            >
                              {doc.status === 'VERIFIED' ? '✓ Verified' : 'Verify'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDocStatus(doc.documentType, 'REJECTED')}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                doc.status === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-rose-100 hover:text-rose-800'
                              }`}
                            >
                              Reject Doc
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl text-center border border-dashed border-slate-200">
                      No document attachments linked yet.
                    </p>
                  )}
                </div>

                {/* Manager Remarks */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Manager Remarks / Decision Notes</label>
                  <textarea
                    rows="2"
                    value={managerRemarks}
                    onChange={(e) => setManagerRemarks(e.target.value)}
                    placeholder="Enter approval/rejection remarks for the applicant..."
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-4 pt-2 border-t border-slate-100 shrink-0">
                  <Button 
                    variant="outline" 
                    className="flex-1 text-red-600 hover:bg-red-50 border-red-200 font-bold py-3 cursor-pointer"
                    onClick={() => handleUpdateStatus(selectedLoan._id, 'Rejected')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Reject Loan'}
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 cursor-pointer"
                    onClick={() => handleUpdateStatus(selectedLoan._id, 'Approved')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Processing...' : 'Approve Application'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACTION CENTER MODAL 1: ASSIGN VERIFICATION OFFICERS */}
      {showOfficerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck size={20} className="text-indigo-600" /> Assign Verification Field Officers
                </h3>
                <p className="text-xs text-slate-500">Dispatch physical/KYC verification tasks to authorized branch officers.</p>
              </div>
              <button onClick={() => setShowOfficerModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {officerAssignedSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" /> Verification Officer assigned successfully!
              </div>
            ) : (
              <form onSubmit={handleAssignOfficerSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Application *</label>
                  <select
                    required
                    value={officerTargetApp}
                    onChange={(e) => setOfficerTargetApp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">Select Application Pending Audit</option>
                    {safeLoans.map((l) => (
                      <option key={l._id} value={l.applicationId || l._id}>
                        {l.applicationId} — {l.applicantDetails?.fullName || l.citizenId?.name} (₹{Number(l.amount).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Verification Officer *</label>
                  <select
                    required
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="">Select Officer Roster</option>
                    <option value="Amit Sharma">Amit Sharma (Senior KYC & Identity Auditor)</option>
                    <option value="Suresh Verma">Suresh Verma (Field Verification Inspector)</option>
                    <option value="Neha Gupta">Neha Gupta (Income & Asset Valuation Officer)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Inspection Instructions / Notes</label>
                  <textarea
                    rows="2"
                    placeholder="Enter physical address check or income verification instructions..."
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowOfficerModal(false)}>Cancel</Button>
                  <Button type="submit" className="bg-indigo-600 text-white font-bold text-xs flex items-center gap-1">
                    <Send size={14} /> Dispatch Assignment
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ACTION CENTER MODAL 2: REVIEW AI DISCREPANCIES */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert size={20} className="text-amber-600" /> AI Discrepancy & Risk Radar
                </h3>
                <p className="text-xs text-slate-500">Automated AI risk flags and credit score variance inspection.</p>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {aiClearedSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" /> AI Discrepancy Flags Cleared by Branch Manager!
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>AI Risk Scan Findings</span>
                    <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[10px]">2 Flags Detected</span>
                  </div>
                  <p className="text-amber-800 text-[11px]">
                    Automatic scanning flagged potential income-to-EMI variances in 2 active branch applications.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">Pooja K — Home Loan (₹2,500,000)</div>
                      <div className="text-[11px] text-slate-500">AI Score: 680 • Stated Income vs Document Variance: 4.2%</div>
                    </div>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-[10px]">Low Risk</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-900">Phase 10 Applicant — Business Loan (₹150,000)</div>
                      <div className="text-[11px] text-slate-500">AI Score: 720 • Pincode Match: Mapped</div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">Eligible</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setShowAiModal(false)}>Close</Button>
                  <Button onClick={handleClearAiDiscrepancies} className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer">
                    <CheckCircle2 size={14} /> Clear AI Flags & Approve Override
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

const KPICard = ({ title, value, icon }) => (
  <Card hoverable className="flex items-center gap-4">
    <div className="p-3 bg-gray-50 rounded-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </Card>
);

const ApplicationRow = ({ loan, onReview }) => (
  <div className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:border-primary/30 transition-colors bg-gray-50/50">
    <div>
      <p className="font-bold text-gray-900 text-sm">{loan.applicantDetails?.fullName || loan.citizenId?.name || 'Unknown'}</p>
      <p className="text-xs text-gray-500">{loan.loanProductId?.name || 'Loan'} • ₹{loan.amount ? Number(loan.amount).toLocaleString('en-IN') : '0'}</p>
    </div>
    <div className="text-right flex items-center gap-6">
      <div className="text-right hidden sm:block">
        <p className="text-xs text-gray-500">AI Score</p>
        <p className={`font-bold text-xs ${loan.creditScorePrediction > 700 ? 'text-emerald-600' : 'text-amber-600'}`}>{loan.creditScorePrediction || '680'}</p>
      </div>
      <div className="text-right hidden md:block">
        <p className="text-xs text-gray-500">AI Suggestion</p>
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${loan.eligibilityPrediction === 'Eligible' ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {loan.eligibilityPrediction || 'Eligible'}
        </span>
      </div>
      <Button variant="primary" className="py-1.5 px-4 text-xs font-bold cursor-pointer" onClick={onReview}>Review</Button>
    </div>
  </div>
);

export default ManagerDashboard;
