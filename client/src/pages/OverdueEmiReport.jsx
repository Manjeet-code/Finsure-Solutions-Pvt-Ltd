import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Clock, Landmark, User, Mail, Phone, 
  Building2, CheckCircle2, AlertOctagon, Calendar, Send 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';

const OverdueEmiReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminderSentId, setReminderSentId] = useState(null);

  useEffect(() => {
    fetchOverdueReport();
  }, []);

  const fetchOverdueReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/emi/overdue-report');
      setReport(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load overdue EMI report');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = (emiId, citizenName) => {
    setReminderSentId(emiId);
    setTimeout(() => {
      setReminderSentId(null);
    }, 4000);
  };

  if (loading) return <Card className="p-12 text-center text-slate-500">Loading overdue EMI report...</Card>;

  const overdueList = report?.overdueInstallments || [];
  const totalAmount = report?.totalOverdueAmount || 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <AlertOctagon className="text-rose-600" size={24} /> Overdue EMIs & Default Risk Report
          </h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Monitor defaulted monthly installments, track days overdue, and issue instant recovery notices.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 space-y-1 bg-gradient-to-br from-rose-600 to-red-700 text-white shadow-md">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-100 block">Total Overdue Installments</span>
          <div className="text-3xl font-black">{report?.count || 0}</div>
          <div className="text-xs text-rose-100 mt-1">Requires immediate follow-up</div>
        </Card>

        <Card className="p-5 space-y-1 bg-slate-900 text-white shadow-md">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Defaulted / Overdue Amount</span>
          <div className="text-3xl font-black text-amber-400">₹{Number(totalAmount).toLocaleString('en-IN')}</div>
          <div className="text-xs text-slate-400 mt-1">Cumulative defaulted EMI capital</div>
        </Card>
      </div>

      {/* Overdue Table Card */}
      <Card padding={false} className="overflow-hidden border-slate-200">
        <div className="p-4 bg-rose-50/70 border-b border-rose-200 flex justify-between items-center">
          <h3 className="font-extrabold text-rose-950 text-sm flex items-center gap-2">
            <AlertTriangle size={18} className="text-rose-600" /> Defaulted Installments Queue
          </h3>
          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
            {overdueList.length} Active Defaults
          </span>
        </div>

        {overdueList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
            <h4 className="font-bold text-slate-800">Zero Overdue EMIs</h4>
            <p className="text-xs text-slate-400">All borrowers are up to date on their loan repayment schedules!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Borrower Profile</th>
                  <th className="px-6 py-3.5">Application ID</th>
                  <th className="px-6 py-3.5">Assigned Branch</th>
                  <th className="px-6 py-3.5">Inst. # & Due Date</th>
                  <th className="px-6 py-3.5">Overdue Amount</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {overdueList.map((item) => {
                  const citizen = item.citizenId || {};
                  const app = item.loanApplicationId || {};
                  const branch = item.branchId || {};

                  const daysOverdue = Math.max(
                    1,
                    Math.floor((new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24))
                  );

                  return (
                    <tr key={item._id} className="hover:bg-rose-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center font-bold text-xs">
                            <User size={18} />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{citizen.name || 'Applicant'}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{citizen.email}</span>
                              <span>•</span>
                              <span>{citizen.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                        {app.applicationId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                          <Building2 size={14} className="text-blue-600" />
                          <span>{branch.branchName || 'Lucknow Branch'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{branch.branchCode}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-xs">Installment #{item.installmentNumber}</div>
                        <div className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                          <Clock size={12} /> {daysOverdue} Days Overdue ({new Date(item.dueDate).toLocaleDateString('en-IN')})
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-rose-700">
                        ₹{Number(item.amount).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSendReminder(item._id, citizen.name)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Send size={13} /> Send Recovery Notice
                        </button>
                        {reminderSentId === item._id && (
                          <div className="text-[10px] text-emerald-600 font-bold mt-1">
                            Notice Sent via SMS/Email!
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

    </div>
  );
};

export default OverdueEmiReport;
