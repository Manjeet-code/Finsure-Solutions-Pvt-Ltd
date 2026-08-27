import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, Clock, AlertCircle, FileText, ArrowLeft, ShieldCheck, 
  Building2, User, Landmark, Calendar, FileCheck, Check, RefreshCw, Upload,
  Download, CreditCard, Banknote, ShieldAlert, X
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import api from '../lib/axios';
import { generateSanctionLetterPDF } from '../utils/generateSanctionLetterPDF';

const ApplicationDetails = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  
  // Re-upload Modal State
  const [uploadingDoc, setUploadingDoc] = useState(null);

  // Accept Sanction Modal State
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [sanctionSubmitting, setSanctionSubmitting] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/loans/${id}`);
      const appObj = res.data?.data || res.data;
      setApplication(appObj || null);
      if (appObj?.applicantDetails) {
        setBankForm((prev) => ({
          ...prev,
          accountHolderName: appObj.applicantDetails.fullName || '',
        }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleReupload = async (documentType, file) => {
    if (!file) return;
    setUploadingDoc(documentType);
    setError(null);
    setActionSuccess(null);

    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('document', file);

      await api.post(`/loans/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setActionSuccess(`Re-uploaded ${documentType} successfully! Returned to Branch Review Queue.`);
      fetchApplicationDetails();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to re-upload ${documentType}`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDownloadSanctionPDF = async () => {
    if (!application) return;
    await generateSanctionLetterPDF(application);
  };

  const handleAcceptSanctionSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('Please check the agreement box to accept sanction terms.');
      return;
    }
    setSanctionSubmitting(true);
    setError(null);

    try {
      const res = await api.post(`/loans/${id}/accept-sanction`, bankForm);
      setActionSuccess('Sanction terms accepted & bank details confirmed! Your loan is ready for disbursal.');
      setShowSanctionModal(false);
      fetchApplicationDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept sanction terms');
    } finally {
      setSanctionSubmitting(false);
    }
  };

  const getStepIndex = (status) => {
    switch (status) {
      case 'DRAFT': return 1;
      case 'Submitted': return 2;
      case 'Pending': return 2;
      case 'DOCS_REQUESTED': return 2;
      case 'Verified': return 3;
      case 'Approved': return 4;
      case 'SANCTIONED': return 4;
      case 'Disbursed': return 4;
      default: return 2;
    }
  };

  if (loading) return <Card className="p-12 text-center text-slate-500">Loading application details...</Card>;
  if (error || !application) return <Card className="p-8 text-center text-red-600">{error || 'Application not found'}</Card>;

  const currentStep = getStepIndex(application.status);
  const isApprovedOrSanctioned = ['Approved', 'SANCTIONED', 'Disbursed'].includes(application.status);
  const isDisbursed = application.status === 'Disbursed';

  const steps = [
    { num: 1, label: 'Application Drafted', desc: 'Form completed' },
    { num: 2, label: 'Submitted & Auto-Routed', desc: 'Routed to branch manager' },
    { num: 3, label: 'Document Verification', desc: 'KYC & Income verification' },
    { num: 4, label: 'Sanction & Disbursal', desc: 'Sanction letter & funds transfer' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/my-applications">
          <Button variant="outline" className="text-xs font-bold flex items-center gap-1.5">
            <ArrowLeft size={16} /> Back to My Applications
          </Button>
        </Link>
        <span className="text-xs text-slate-400 font-mono">App ID: {application.applicationId}</span>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> {actionSuccess}
        </div>
      )}

      {/* Disbursed Notification Banner */}
      {isDisbursed && (
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-lg font-black tracking-tight">
            <Banknote size={24} /> Loan Disbursed Successfully!
          </div>
          <p className="text-xs text-emerald-100 font-medium">
            Your approved loan funds of <strong className="text-white text-sm">₹{Number(application.approvedAmount || application.amount).toLocaleString('en-IN')}</strong> have been transferred to your account.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono bg-white/10 p-3 rounded-2xl border border-white/20">
            <div>Transaction Ref: <strong>{application.disbursementRefNumber || 'NEFT-2026-88192'}</strong></div>
            <div>Disbursal Date: <strong>{new Date(application.disbursedAt || application.updatedAt).toLocaleDateString('en-IN')}</strong></div>
            <div>Target Bank: <strong>{application.disbursementAccountDetails?.bankName || 'HDFC Bank'}</strong></div>
          </div>
        </div>
      )}

      {/* Re-upload Action Notification Banner for Citizen */}
      {application.status === 'DOCS_REQUESTED' && (
        <div className="p-5 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <RefreshCw size={18} className="text-amber-700 animate-spin" /> Action Required: Document Re-upload Requested
          </div>
          <p className="text-xs text-amber-800 leading-relaxed font-medium">
            Branch Manager Notes: <strong className="text-amber-950">{application.remarks || 'Please re-upload a clear file for verification.'}</strong>
          </p>
        </div>
      )}

      {/* Phase 8 Sanction Letter Card */}
      {isApprovedOrSanctioned && (
        <Card className="p-6 space-y-4 border-blue-300 bg-gradient-to-br from-blue-50/80 to-white shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-blue-100 pb-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                Phase 8 Sanction Approval
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                <FileText className="text-blue-600" size={22} /> Official Credit Sanction Letter
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ref No: <strong className="text-slate-800 font-mono">{application.sanctionRefNumber || 'SNC-2026-4912'}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <Button
                onClick={handleDownloadSanctionPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Download size={16} /> Download Sanction PDF
              </Button>

              {!application.sanctionAcceptedByApplicant && (
                <Button
                  onClick={() => setShowSanctionModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <CreditCard size={16} /> Accept & Input Bank Details
                </Button>
              )}
            </div>
          </div>

          {/* Sanction Financial Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-4 rounded-xl border border-blue-100">
            <div>
              <span className="text-slate-400 block">Sanctioned Amount:</span>
              <span className="font-black text-blue-700 text-base">₹{Number(application.approvedAmount || application.amount).toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Approved Tenure:</span>
              <span className="font-bold text-slate-800">{application.approvedTenureMonths || application.tenureMonths} Months</span>
            </div>
            <div>
              <span className="text-slate-400 block">Interest Rate:</span>
              <span className="font-bold text-slate-800">{application.loanProductId?.interestRate || 10.5}% p.a.</span>
            </div>
            <div>
              <span className="text-slate-400 block">Sanction Status:</span>
              <span className={`font-bold text-xs px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                application.sanctionAcceptedByApplicant ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {application.sanctionAcceptedByApplicant ? 'Terms Accepted' : 'Pending Acceptance'}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Progress Stepper Card */}
      <Card className="p-6 sm:p-8 space-y-6 bg-gradient-to-br from-white to-blue-50/20 border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">
              {application.loanProductId?.productCode || 'SCHEME'}
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {application.loanProductId?.name || 'Loan Application'}
            </h2>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">
              {application.approvedAmount && application.approvedAmount !== application.amount ? 'Approved Amount' : 'Loan Amount'}
            </span>
            <span className="text-2xl font-black text-blue-700">
              ₹{Number(application.approvedAmount || application.amount).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Visual Progress Stepper Bar */}
        <div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-4">
            Application Milestone Progress
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {steps.map((s) => {
              const isCompleted = currentStep > s.num;
              const isCurrent = currentStep === s.num;

              return (
                <div
                  key={s.num}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20'
                      : isCompleted
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-white text-blue-600'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check size={12} /> : s.num}
                    </div>
                    <span className="text-xs font-extrabold truncate">{s.label}</span>
                  </div>
                  <p className={`text-[10px] ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Grid Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Applicant Profile */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <User size={16} className="text-blue-600" /> Applicant Financial Profile
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Full Name:</span>
              <span className="font-bold text-slate-800">{application.applicantDetails?.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Monthly Income:</span>
              <span className="font-bold text-slate-800">₹{Number(application.applicantDetails?.monthlyIncome).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Employment Type:</span>
              <span className="font-bold text-slate-800">{application.applicantDetails?.employmentType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">City / State:</span>
              <span className="font-bold text-slate-800">{application.applicantDetails?.city}, {application.applicantDetails?.state}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400">Pincode:</span>
              <span className="font-bold text-blue-700">{application.applicantDetails?.pincode}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Assigned Branch:</span>
              <span className="font-bold text-slate-800">{application.branchId?.branchName || 'Lucknow Branch'}</span>
            </div>
          </div>
        </Card>

        {/* Uploaded Documents */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileCheck size={16} className="text-emerald-600" /> Uploaded KYC Documents
          </h3>

          {application.uploadedDocuments?.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No KYC documents uploaded yet.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {application.uploadedDocuments.map((doc, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 gap-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-600 shrink-0" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">{doc.documentType.replace('_', ' ')}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                          doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                      {doc.remarks && <p className="text-[10px] text-red-600 italic">{doc.remarks}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`http://localhost:5000${doc.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                    >
                      View
                    </a>

                    {(doc.status === 'REJECTED' || application.status === 'DOCS_REQUESTED') && (
                      <label className="cursor-pointer text-[11px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 flex items-center gap-1">
                        <Upload size={12} /> Re-upload
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => handleReupload(doc.documentType, e.target.files[0])}
                          disabled={uploadingDoc === doc.documentType}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>

      {/* Accept Sanction & Input Bank Account Modal */}
      {showSanctionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 border border-blue-100 relative">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="text-blue-600" size={22} /> Accept Sanction & Bank Disbursal Entry
                </h3>
                <p className="text-xs text-slate-500 font-medium">Input your bank account details where loan funds will be disbursed</p>
              </div>
              <button onClick={() => setShowSanctionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAcceptSanctionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC Bank / ICICI Bank"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    value={bankForm.accountHolderName}
                    onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50100294102948"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">IFSC Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HDFC0001234"
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-blue-600" /> Sanction Terms Agreement Summary
                </div>
                <p className="text-slate-600">
                  By accepting, you agree to monthly EMI auto-debit on the 5th of each month for a sanctioned amount of <strong>₹{Number(application.approvedAmount || application.amount).toLocaleString('en-IN')}</strong> at {application.loanProductId?.interestRate || 10.5}% p.a. interest.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="termsCheck"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="termsCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                  I accept all terms and conditions specified in Sanction Letter {application.sanctionRefNumber}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowSanctionModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sanctionSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {sanctionSubmitting ? 'Submitting...' : 'Accept Sanction & Confirm Disbursal Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ApplicationDetails;
