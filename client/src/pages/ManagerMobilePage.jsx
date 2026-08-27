import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Phone, MapPin, Camera, CheckCircle2, XCircle, Clock, 
  ChevronRight, ArrowLeft, Upload, FileText, ShieldCheck, AlertCircle, RefreshCw, Send, Eye, Building2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';

const ManagerMobilePage = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Photo Evidence Upload State
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [evidenceType, setEvidenceType] = useState('SITE_INSPECTION_PHOTO');
  const [locationText, setLocationText] = useState('');
  const [uploading, setUploading] = useState(false);

  // Quick Decision State
  const [remarks, setRemarks] = useState('');
  const [decideLoading, setDecideLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchMobileQueue();
  }, []);

  const fetchMobileQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loans/branch-queue');
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setApplications(list);
      if (list.length > 0 && !selectedApp) {
        setSelectedApp(list[0]);
        setRemarks(list[0].remarks || '');
      }
    } catch (err) {
      console.error('Failed to fetch mobile review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocToggle = async (documentType, currentStatus) => {
    if (!selectedApp) return;
    const newStatus = currentStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
    try {
      const res = await api.post(`/loans/${selectedApp._id}/verify-doc`, {
        documentType,
        status: newStatus,
        remarks: `Doc ${documentType} updated via mobile field view`,
      });
      const updated = res.data?.data || res.data;
      setSelectedApp(updated);
      showToast(`Document ${documentType} marked as ${newStatus}`);
    } catch (err) {
      console.error('Doc toggle error:', err);
    }
  };

  const handleUploadFieldEvidence = async (e) => {
    e.preventDefault();
    if (!selectedApp || !evidenceFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('evidence', evidenceFile);
      formData.append('evidenceType', evidenceType);
      formData.append('locationText', locationText || selectedApp.applicantDetails?.city || 'On-site');
      formData.append('remarks', `Photo evidence uploaded via mobile field app`);

      const res = await api.post(`/loans/${selectedApp._id}/field-evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const updated = res.data?.data || res.data;
      setSelectedApp(updated);
      setEvidenceFile(null);
      setLocationText('');
      showToast('Field inspection photo uploaded successfully!');
    } catch (err) {
      console.error('Evidence upload error:', err);
      showToast('Failed to upload photo evidence');
    } finally {
      setUploading(false);
    }
  };

  const handleQuickDecision = async (decision) => {
    if (!selectedApp) return;
    setDecideLoading(true);
    try {
      await api.post(`/loans/${selectedApp._id}/decide`, {
        decision,
        remarks: remarks || `Decision ${decision} submitted via Branch Manager Mobile Field App`,
      });

      showToast(`Application ${selectedApp.applicationId} marked as ${decision}!`);
      fetchMobileQueue();
    } catch (err) {
      console.error('Quick decision error:', err);
      showToast('Failed to record decision');
    } finally {
      setDecideLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredApps = applications.filter(a => filterStatus === 'ALL' || a.status === filterStatus);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-900 text-slate-100 pb-12 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-2xl flex items-center gap-2">
          <CheckCircle2 size={16} /> {toastMessage}
        </div>
      )}

      {/* Mobile Top Header Bar */}
      <header className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
            <Smartphone size={18} />
          </div>
          <div>
            <span className="font-black text-sm text-white tracking-tight block">FinSure Field Manager</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block">On-The-Go Verification</span>
          </div>
        </div>

        <Button onClick={fetchMobileQueue} variant="outline" className="text-xs p-2 text-slate-300 border-slate-800">
          <RefreshCw size={14} />
        </Button>
      </header>

      {/* Status Filter Horizontal Tabs */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
        {['ALL', 'Submitted', 'DOCS_REQUESTED', 'Verified', 'Approved'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-full text-nowrap transition-all cursor-pointer ${
              filterStatus === st
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {st === 'ALL' ? 'All Queue' : st}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4 flex-1">
        
        {/* Applications On-The-Go Selector */}
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
            Assigned Queue ({filteredApps.length})
          </span>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {filteredApps.map((app) => {
              const isSelected = selectedApp?._id === app._id;
              return (
                <div
                  key={app._id}
                  onClick={() => {
                    setSelectedApp(app);
                    setRemarks(app.remarks || '');
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer shrink-0 w-64 space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg ring-2 ring-blue-400/30'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-xs">{app.applicationId}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <div className="font-bold text-sm truncate">{app.applicantDetails?.fullName || app.citizenId?.name}</div>
                  <div className="flex justify-between text-[11px] opacity-80">
                    <span>₹{Number(app.amount).toLocaleString('en-IN')}</span>
                    <span>{app.applicantDetails?.pincode}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Application Field Workspace */}
        {selectedApp ? (
          <div className="space-y-4">
            
            {/* Applicant Profile Card with Quick Call Button */}
            <Card className="p-4 bg-slate-950 border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Field Inspection Target</span>
                  <h3 className="text-base font-black text-white">{selectedApp.applicantDetails?.fullName || selectedApp.citizenId?.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-blue-400" /> {selectedApp.applicantDetails?.city || 'Lucknow'} ({selectedApp.applicantDetails?.pincode})
                  </div>
                </div>

                {/* Quick Call Action */}
                <a
                  href={`tel:${selectedApp.applicantDetails?.phone || selectedApp.citizenId?.phone || '9999999999'}`}
                  className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center gap-1.5 text-xs font-bold shadow-md cursor-pointer shrink-0"
                >
                  <Phone size={16} /> Call Applicant
                </a>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px]">Loan Scheme</span>
                  <span className="font-bold text-slate-200">{selectedApp.loanProductId?.name || 'Loan'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Requested Capital</span>
                  <span className="font-black text-emerald-400">₹{Number(selectedApp.amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Card>

            {/* Quick KYC Verification Touch Checklist */}
            <Card className="p-4 bg-slate-950 border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>KYC Verification Touch Checklist</span>
                <ShieldCheck size={16} className="text-blue-400" />
              </h4>

              <div className="space-y-2 text-xs">
                {selectedApp.uploadedDocuments?.map((doc, idx) => {
                  const isVerified = doc.status === 'VERIFIED';
                  return (
                    <div
                      key={idx}
                      onClick={() => handleDocToggle(doc.documentType, doc.status)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isVerified
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isVerified ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'
                        }`}>
                          ✓
                        </div>
                        <div>
                          <span className="font-bold text-xs block">{doc.documentType?.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-slate-500">{doc.status}</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isVerified ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isVerified ? 'VERIFIED' : 'TAP TO VERIFY'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Live Photo / Field Evidence Upload */}
            <Card className="p-4 bg-slate-950 border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Field Evidence / Site Photo Upload</span>
                <Camera size={16} className="text-emerald-400" />
              </h4>

              <form onSubmit={handleUploadFieldEvidence} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 text-[10px] font-bold mb-1">Evidence Category</label>
                  <select
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SITE_INSPECTION_PHOTO">Physical Site / Residence Inspection</option>
                    <option value="BUSINESS_SHOP_PHOTO">Business Premise / Shop Photo</option>
                    <option value="INCOME_PROOF_EVIDENCE">Asset / Income Proof Evidence</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold mb-1">Capture / Choose Photo *</label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    required
                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={uploading || !evidenceFile}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 py-2.5 cursor-pointer"
                >
                  <Upload size={14} /> {uploading ? 'Uploading Evidence...' : 'Upload Field Photo Evidence'}
                </Button>
              </form>
            </Card>

            {/* Quick Decision Drawer */}
            <Card className="p-4 bg-slate-950 border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Field Inspection Decision Notes
              </h4>

              {/* Pre-filled remarks shortcuts */}
              <div className="flex gap-1.5 flex-wrap">
                {[
                  'Physical Residence Inspection Passed',
                  'Income & Asset Proof Verified',
                  'Address Mismatch - Re-verify Required',
                ].map((txt) => (
                  <button
                    key={txt}
                    type="button"
                    onClick={() => setRemarks(txt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold text-slate-400 cursor-pointer"
                  >
                    + {txt}
                  </button>
                ))}
              </div>

              <textarea
                rows="2"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter field inspection notes..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs font-medium focus:ring-2 focus:ring-blue-500"
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <Button
                  onClick={() => handleQuickDecision('Rejected')}
                  disabled={decideLoading}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 cursor-pointer"
                >
                  Reject
                </Button>

                <Button
                  onClick={() => handleQuickDecision('Approved')}
                  disabled={decideLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 cursor-pointer"
                >
                  Approve Application
                </Button>
              </div>
            </Card>

          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-950 rounded-2xl border border-slate-800">
            No active application selected.
          </div>
        )}

      </div>
    </div>
  );
};

export default ManagerMobilePage;
