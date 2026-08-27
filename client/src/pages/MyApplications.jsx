import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderCheck, FileText, Clock, CheckCircle2, AlertCircle, Plus, Eye, Edit3, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/loans/my');
      const appList = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setApplications(appList);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT':
        return <Badge status="PENDING">Draft</Badge>;
      case 'Submitted':
      case 'Pending':
        return <Badge status="PENDING">Under Review</Badge>;
      case 'Verified':
        return <Badge status="VERIFIED">Verified</Badge>;
      case 'Approved':
      case 'Disbursed':
        return <Badge status="APPROVED">Approved</Badge>;
      case 'Rejected':
        return <Badge status="REJECTED">Rejected</Badge>;
      default:
        return <Badge status="PENDING">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Applications</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Track real-time approval progress and view status updates for your submitted loan applications.
          </p>
        </div>
        <Link to="/apply">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2">
            <Plus size={18} /> Apply for New Loan
          </Button>
        </Link>
      </div>

      {loading ? (
        <Card className="p-12 text-center text-slate-500">Loading your applications...</Card>
      ) : error ? (
        <Card className="p-8 text-center text-red-600">{error}</Card>
      ) : applications.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <FolderCheck size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Loan Applications Found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            You haven't submitted any loan applications yet. Explore loan products and apply online in minutes.
          </p>
          <Link to="/apply">
            <Button variant="primary" className="mt-2">Start New Application</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => (
            <Card key={app._id} className="p-6 hover:shadow-md transition-shadow space-y-4 border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base">{app.applicationId || 'APP-2026-DRAFT'}</span>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Product: <strong className="text-slate-800">{app.loanProductId?.name || 'Loan Product'}</strong>
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 block font-medium">Loan Amount</span>
                  <span className="text-xl font-black text-blue-700">₹{Number(app.amount).toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Application Details Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block">Tenure:</span>
                  <span className="font-bold text-slate-800">{app.tenureMonths} Months</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Applicant:</span>
                  <span className="font-bold text-slate-800">{app.applicantDetails?.fullName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">City / Pincode:</span>
                  <span className="font-bold text-slate-800">{app.applicantDetails?.city} ({app.applicantDetails?.pincode})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Submitted On:</span>
                  <span className="font-bold text-slate-800">{new Date(app.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Docs Uploaded: <strong className="text-slate-700">{app.uploadedDocuments?.length || 0} files</strong>
                </div>

                <div className="flex items-center gap-2">
                  {app.status === 'DRAFT' ? (
                    <Link to={`/apply`}>
                      <Button variant="outline" className="text-xs font-bold flex items-center gap-1.5">
                        <Edit3 size={14} /> Continue Draft
                      </Button>
                    </Link>
                  ) : (
                    <Link to={`/applications/${app._id}`}>
                      <Button variant="outline" className="text-xs font-bold flex items-center gap-1.5">
                        <Eye size={14} /> View Status Tracker <ArrowRight size={14} />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default MyApplications;
