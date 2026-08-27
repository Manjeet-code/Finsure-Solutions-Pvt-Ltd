import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Building2, UserCheck, Package, ShieldCheck, TrendingUp, 
  ArrowRight, FileText, Plus, CheckCircle2, Clock, Mail, Phone, ChevronRight, BarChart3, ShieldAlert
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminDashboardData();
  }, []);

  const fetchAdminDashboardData = async () => {
    setLoading(true);
    try {
      const [platformRes, branchesRes, loansRes] = await Promise.all([
        api.get('/analytics/platform-summary'),
        api.get('/branches'),
        api.get('/loans/branch-queue').catch(() => ({ data: [] })),
      ]);

      const pData = platformRes.data?.data || platformRes.data;
      const bData = branchesRes.data || [];
      const lData = Array.isArray(loansRes.data?.data) ? loansRes.data.data : Array.isArray(loansRes.data) ? loansRes.data : [];

      setStats(pData);
      setBranches(bData);
      setRecentApps(lData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Card className="p-12 text-center text-slate-500">Loading Admin Control Center...</Card>;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">FinSure Operations Command Center</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            System administration, branch network management, staff onboarding, and operations workflow control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/branch-managers">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
              <Plus size={16} /> Onboard Manager
            </Button>
          </Link>
          <Link to="/branches">
            <Button variant="outline" className="text-xs font-bold flex items-center gap-1.5">
              <Building2 size={16} /> Add Branch
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Registered Applicants</span>
          <div className="text-3xl font-black">{stats?.totalUsers || 0}</div>
          <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
            <Users size={14} className="text-blue-400" /> Active Citizen Accounts
          </div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Regional Branches</span>
          <div className="text-3xl font-black text-slate-900">{stats?.totalBranches || branches.length}</div>
          <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
            <Building2 size={14} /> Operational Regional Hubs
          </div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Branch Manager Staff</span>
          <div className="text-3xl font-black text-slate-900">{stats?.totalManagers || 0}</div>
          <div className="text-[11px] text-teal-700 font-bold flex items-center gap-1 mt-1">
            <UserCheck size={14} /> Active Authorized Staff
          </div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Review Applications</span>
          <div className="text-3xl font-black text-amber-600">{stats?.pendingCount || 0}</div>
          <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1 mt-1">
            <Clock size={14} /> In Branch Verification Queue
          </div>
        </Card>
      </div>

      {/* Admin Quick Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/branches">
          <Card className="p-5 hover:border-blue-500 hover:shadow-md transition-all space-y-2 border-slate-200 cursor-pointer group">
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center justify-between">
              Branch Management <ArrowRight size={16} />
            </h3>
            <p className="text-xs text-slate-500 font-medium">Configure regional branches, assigned cities, and mapped pincodes.</p>
          </Card>
        </Link>

        <Link to="/branch-managers">
          <Card className="p-5 hover:border-teal-500 hover:shadow-md transition-all space-y-2 border-slate-200 cursor-pointer group">
            <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center font-bold">
              <UserCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-600 transition-colors flex items-center justify-between">
              Branch Managers <ArrowRight size={16} />
            </h3>
            <p className="text-xs text-slate-500 font-medium">Onboard manager staff, inspect profiles, or terminate/fire accounts.</p>
          </Card>
        </Link>

        <Link to="/loan-products">
          <Card className="p-5 hover:border-purple-500 hover:shadow-md transition-all space-y-2 border-slate-200 cursor-pointer group">
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center font-bold">
              <Package size={20} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors flex items-center justify-between">
              Loan Products <ArrowRight size={16} />
            </h3>
            <p className="text-xs text-slate-500 font-medium">Manage Home, Personal, Vehicle, and Business loan scheme parameters.</p>
          </Card>
        </Link>

        <Link to="/analytics">
          <Card className="p-5 hover:border-indigo-500 hover:shadow-md transition-all space-y-2 border-indigo-100 bg-indigo-50/40 cursor-pointer group">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-indigo-950 text-sm group-hover:text-indigo-600 transition-colors flex items-center justify-between">
              Platform Analytics <ArrowRight size={16} />
            </h3>
            <p className="text-xs text-indigo-900 font-medium">Deep financial portfolio KPIs, branch performance matrix & drill-down.</p>
          </Card>
        </Link>
      </div>

      {/* System Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Regional Branches Roster */}
        <Card className="p-6 space-y-4 border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" /> Active Regional Branches ({branches.length})
            </h3>
            <Link to="/branches" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
          </div>

          <div className="space-y-3">
            {branches.map((b) => (
              <div key={b._id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{b.branchName}</div>
                    <div className="text-slate-500 text-[11px]">{b.branchCode} • {b.city}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">{b.managerId?.name || 'Manager Assigned'}</span>
                  <span className="text-[10px] text-blue-600 block">{b.pincodes?.length || 0} Pincodes Mapped</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Applications Feed */}
        <Card className="p-6 space-y-4 border-slate-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <FileText size={18} className="text-slate-700" /> Recent Application Workflow Feed
            </h3>
            <Link to="/applications" className="text-xs font-bold text-blue-600 hover:underline">Review Queue</Link>
          </div>

          {recentApps.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4 text-center">No recent application activity.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {recentApps.map((app) => (
                <div key={app._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{app.applicationId}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        app.status === 'Disbursed' ? 'bg-emerald-600 text-white' :
                        app.status === 'Approved' || app.status === 'SANCTIONED' ? 'bg-emerald-100 text-emerald-800' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-0.5">{app.applicantDetails?.fullName || app.citizenId?.name} • ₹{Number(app.amount).toLocaleString('en-IN')}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{new Date(app.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

      </div>

    </div>
  );
};

export default AdminDashboard;
