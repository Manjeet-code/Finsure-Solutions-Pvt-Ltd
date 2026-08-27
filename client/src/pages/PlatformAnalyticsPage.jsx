import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Building2, Landmark, AlertTriangle, Download, Mail, Phone, 
  Users, CheckCircle2, ChevronRight, PieChart, Layers, BarChart3, Filter, FileText, Send, XCircle
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';
import { generateBranchReportPDF } from '../utils/generateBranchReportPDF';
import { generatePlatformAnalyticsPDF } from '../utils/generatePlatformAnalyticsPDF';

const PlatformAnalyticsPage = () => {
  const [platformData, setPlatformData] = useState(null);
  const [branchMatrix, setBranchMatrix] = useState([]);
  const [loading, setLoading] = useState(true);

  // Drill-Down States (Level 1 -> Level 2 -> Level 3 -> Level 4)
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [drilldownApps, setDrilldownApps] = useState([]);
  const [drilldownLoading, setDrilldownLoading] = useState(false);
  const [selectedAppDetail, setSelectedAppDetail] = useState(null);
  const [appAuditLogs, setAppAuditLogs] = useState([]);

  // Contact Manager Modal State
  const [contactingManager, setContactingManager] = useState(null);
  const [managerMsg, setManagerMsg] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [platformRes, matrixRes] = await Promise.all([
        api.get('/analytics/platform-summary'),
        api.get('/analytics/branch-matrix'),
      ]);

      const pData = platformRes.data?.data || platformRes.data;
      const bMatrix = matrixRes.data?.data || matrixRes.data || [];

      setPlatformData(pData);
      setBranchMatrix(bMatrix);

      if (bMatrix.length > 0) {
        handleBranchDrilldown(bMatrix[0]);
      }
    } catch (err) {
      console.error('Failed to fetch platform analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchDrilldown = async (branch) => {
    setSelectedBranch(branch);
    setSelectedAppDetail(null);
    setDrilldownLoading(true);

    try {
      const res = await api.get(`/analytics/drilldown/branch/${branch._id}`);
      const payload = res.data?.data || res.data;
      setDrilldownApps(payload?.applications || []);
      if (payload?.applications?.length > 0) {
        handleSelectAppDetail(payload.applications[0]);
      }
    } catch (err) {
      console.error('Branch drilldown error:', err);
    } finally {
      setDrilldownLoading(false);
    }
  };

  const handleSelectAppDetail = async (app) => {
    setSelectedAppDetail(app);
    try {
      const res = await api.get(`/loans/${app._id}/audit-trail`);
      setAppAuditLogs(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    }
  };

  const handleExportPlatformPDF = async () => {
    await generatePlatformAnalyticsPDF({
      platformData,
      branchMatrix,
      drilldownApps,
    });
  };

  const handleDownloadPDFReport = async () => {
    if (!selectedBranch) return;
    await generateBranchReportPDF({
      branchName: selectedBranch.branchName,
      branchCode: selectedBranch.branchCode,
      city: selectedBranch.city,
      managerName: selectedBranch.managerName,
      totalApplications: selectedBranch.totalApplications,
      approvedCount: selectedBranch.approvedCount,
      rejectedCount: selectedBranch.rejectedCount,
      disbursedVolume: selectedBranch.disbursedVolume,
      approvalRate: selectedBranch.approvalRate,
      recentApplications: drilldownApps,
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    setMsgSent(true);
    setTimeout(() => {
      setMsgSent(false);
      setContactingManager(null);
      setManagerMsg('');
    }, 2000);
  };

  if (loading) return <Card className="p-12 text-center text-slate-500">Loading platform analytics & drill-down intelligence...</Card>;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
              Phase 11 Intelligence Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <BarChart3 className="text-indigo-600" size={24} /> National Platform Analytics & Reports
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            4-Level Drill-Down Hierarchy: Platform Overview → Regional Branch Matrix → Application Queue → Document Audit Trail.
          </p>
        </div>

        <Button
          onClick={handleExportPlatformPDF}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
        >
          <Download size={16} /> Export Executive PDF Report
        </Button>
      </div>

      {/* LEVEL 1: Financial Portfolio KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1 bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-200 block">Total Portfolio Applications</span>
          <div className="text-3xl font-black">{platformData?.totalApplications || 0}</div>
          <div className="text-[11px] text-indigo-200 font-medium flex items-center gap-1 mt-1">
            <Users size={14} /> Registered Applicants: {platformData?.totalUsers || 0}
          </div>
        </Card>

        <Card className="p-5 space-y-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-100 block">Platform Approval Rate</span>
          <div className="text-3xl font-black">{platformData?.approvalRate || 0}%</div>
          <div className="text-[11px] text-blue-100 font-bold flex items-center gap-1 mt-1">
            <TrendingUp size={14} /> Total Approved: {platformData?.approvedCount || 0} / {platformData?.totalApplications || 0}
          </div>
        </Card>

        <Card className="p-5 space-y-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">Total Disbursed Volume</span>
          <div className="text-3xl font-black">₹{Number(platformData?.totalDisbursedAmount || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-100 font-medium flex items-center gap-1 mt-1">
            <Landmark size={14} /> Net Capital Disbursed
          </div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border-rose-200 shadow-md">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Default Risk Exposure</span>
          <div className="text-3xl font-black text-rose-600">₹{Number(platformData?.totalOverdueAmount || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-rose-600 font-bold flex items-center gap-1 mt-1">
            <AlertTriangle size={14} /> Active Overdue EMIs: {platformData?.overdueCount || 0}
          </div>
        </Card>
      </div>

      {/* LEVEL 2: Regional Branch Performance Matrix */}
      <Card padding={false} className="overflow-hidden border-indigo-100 shadow-xs">
        <div className="p-4 bg-indigo-50/60 border-b border-indigo-100 flex justify-between items-center">
          <div>
            <h3 className="font-black text-indigo-950 text-sm flex items-center gap-2">
              <Building2 size={18} className="text-indigo-600" /> Regional Branch Performance Matrix (Level 2)
            </h3>
            <p className="text-[11px] text-indigo-800 font-medium">Comparative analysis of branch turnaround, approvals, and capital disbursal.</p>
          </div>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full border border-indigo-200">
            {branchMatrix.length} Regional Branches
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Branch Profile</th>
                <th className="px-6 py-3.5">Branch Manager</th>
                <th className="px-6 py-3.5">Total Received</th>
                <th className="px-6 py-3.5">Approved / Rejected</th>
                <th className="px-6 py-3.5">Disbursed Volume</th>
                <th className="px-6 py-3.5">Approval Rate</th>
                <th className="px-6 py-3.5">Avg Turnaround</th>
                <th className="px-6 py-3.5 text-right">Drill-Down Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {branchMatrix.map((b) => {
                const isSelected = selectedBranch?._id === b._id;

                return (
                  <tr
                    key={b._id}
                    onClick={() => handleBranchDrilldown(b)}
                    className={`transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50/80 font-bold border-l-4 border-l-indigo-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Building2 size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{b.branchName}</div>
                          <div className="text-xs text-indigo-600 font-mono">{b.branchCode} ({b.city})</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <div className="font-bold text-slate-800">{b.managerName}</div>
                        <div className="text-slate-400">{b.managerEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {b.totalApplications}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="text-emerald-700 font-bold">{b.approvedCount} Appr</span>
                      <span className="text-slate-400 mx-1">•</span>
                      <span className="text-rose-600 font-bold">{b.rejectedCount} Rej</span>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-700">
                      ₹{Number(b.disbursedVolume).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-extrabold ${
                        b.approvalRate >= 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.approvalRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700 text-xs">
                      {b.avgTurnaroundDays || 1.2} Days
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContactingManager(b);
                        }}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-all shadow-2xs mr-2 cursor-pointer"
                      >
                        Contact Manager
                      </button>
                      <button
                        onClick={() => handleBranchDrilldown(b)}
                        className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        Drill-Down →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* LEVEL 3 & LEVEL 4 DRILL-DOWN GRID */}
      {selectedBranch && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEVEL 3: Branch Application Listing */}
          <Card className="p-6 space-y-4 border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                  Level 3 Branch Queue
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Applications in {selectedBranch.branchName} ({drilldownApps.length})
                </h3>
              </div>
            </div>

            {drilldownLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading branch application queue...</div>
            ) : drilldownApps.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 italic">No applications assigned to this branch yet.</div>
            ) : (
              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                {drilldownApps.map((app) => {
                  const isSelectedApp = selectedAppDetail?._id === app._id;

                  return (
                    <div
                      key={app._id}
                      onClick={() => handleSelectAppDetail(app)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1 ${
                        isSelectedApp
                          ? 'bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-600/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-900 text-xs">{app.applicationId}</span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          app.status === 'Disbursed' ? 'bg-emerald-600 text-white' :
                          app.status === 'Approved' || app.status === 'SANCTIONED' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'DOCS_REQUESTED' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                          app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800">{app.applicantDetails?.fullName || app.citizenId?.name}</div>
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Amt: ₹{Number(app.approvedAmount || app.amount).toLocaleString('en-IN')}</span>
                        <span>{app.applicantDetails?.pincode}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* LEVEL 4: Selected Application KYC Documents & Workflow Audit Trail */}
          {selectedAppDetail ? (
            <Card className="p-6 space-y-4 border-slate-200">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                  Level 4 Document & Audit Trail
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  Audit History — {selectedAppDetail.applicationId}
                </h3>
              </div>

              {/* KYC Documents Overview */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  KYC Verification Checklist
                </h4>
                <div className="space-y-1.5 text-xs">
                  {selectedAppDetail.uploadedDocuments?.map((doc, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{doc.documentType.replace('_', ' ')}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workflow Audit Logs */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Chronological Event Log
                </h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
                  {appAuditLogs.map((log) => (
                    <div key={log._id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-900">{log.action.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{log.remarks}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center text-xs text-slate-400 italic">
              Select an application on the left to view document & audit details.
            </Card>
          )}

        </div>
      )}

      {/* Contact Manager Modal */}
      {contactingManager && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Contact Branch Manager</h3>
                <p className="text-xs text-slate-500">{contactingManager.branchName} ({contactingManager.branchCode})</p>
              </div>
              <button onClick={() => setContactingManager(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-slate-900">{contactingManager.managerName}</div>
              <div className="text-slate-600 flex items-center gap-1.5"><Mail size={12} /> {contactingManager.managerEmail}</div>
            </div>

            {msgSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} /> Direct message sent to Branch Manager!
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message Content</label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Enter urgent review request or audit inquiry..."
                    value={managerMsg}
                    onChange={(e) => setManagerMsg(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setContactingManager(null)}>Cancel</Button>
                  <Button type="submit" className="bg-indigo-600 text-white font-bold text-xs flex items-center gap-1">
                    <Send size={14} /> Send Message
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default PlatformAnalyticsPage;
