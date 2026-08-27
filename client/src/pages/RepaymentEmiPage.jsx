import React, { useState, useEffect } from 'react';
import { 
  Landmark, Calendar, Clock, CheckCircle2, AlertCircle, Banknote, 
  ShieldCheck, CreditCard, ArrowRight, Wallet, Check, AlertTriangle, RefreshCw, X, ChevronRight 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import api from '../lib/axios';
import MockRepaymentGatewayModal from '../components/MockRepaymentGatewayModal';

const RepaymentEmiPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLoanId, setSelectedLoanId] = useState(null);

  // Pay EMI Modal state
  const [payingEmi, setPayingEmi] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [payLoading, setPayLoading] = useState(false);
  const [paySuccess, setPaySuccess] = useState(null);

  useEffect(() => {
    fetchMyEmiSchedule();
  }, []);

  const fetchMyEmiSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get('/emi/my-schedule');
      const payload = res.data?.data || res.data;
      setData(payload);
      if (payload?.loans?.length > 0) {
        setSelectedLoanId(payload.loans[0]._id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load EMI schedules');
    } finally {
      setLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!payingEmi) return;
    setPayLoading(true);
    setError(null);
    setPaySuccess(null);

    try {
      const res = await api.post(`/emi/pay/${payingEmi._id}`, {
        paymentMethod,
        transactionRef: `PAY-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      });

      setPaySuccess(res.data?.message || 'EMI installment paid successfully!');
      setPayingEmi(null);
      fetchMyEmiSchedule();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process EMI payment');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) return <Card className="p-12 text-center text-slate-500">Loading your EMI repayment schedules...</Card>;

  const summary = data?.summary || {};
  const loans = data?.loans || [];
  const allSchedules = data?.schedules || [];

  const activeSchedules = selectedLoanId
    ? allSchedules.filter((s) => (s.loanApplicationId?._id || s.loanApplicationId) === selectedLoanId)
    : allSchedules;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">EMI Schedule & Repayment Tracker</h1>
          <p className="text-slate-500 text-xs font-medium mt-0.5">
            Track monthly EMI installments, view reducing balance schedules, and pay upcoming due payments.
          </p>
        </div>
      </div>

      {paySuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" /> {paySuccess}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
          <AlertCircle size={18} className="text-red-600 shrink-0" /> {error}
        </div>
      )}

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-100 block">Total Disbursed Principal</span>
          <div className="text-2xl font-black">₹{Number(summary.totalDisbursed || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-blue-100 flex items-center gap-1 mt-1">
            <Landmark size={14} /> Active Loans: {loans.length}
          </div>
        </Card>

        <Card className="p-5 space-y-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">Total Repaid Amount</span>
          <div className="text-2xl font-black">₹{Number(summary.totalPaid || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-emerald-100 flex items-center gap-1 mt-1">
            <CheckCircle2 size={14} /> Paid Installments: {summary.paidCount || 0} / {summary.totalInstallments || 0}
          </div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Balance</span>
          <div className="text-2xl font-black text-slate-900">₹{Number(summary.remainingBalance || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Pending EMIs: {summary.pendingCount || 0}
          </div>
        </Card>

        <Card className="p-5 space-y-1 bg-white border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Upcoming EMI</span>
          <div className="text-2xl font-black text-blue-700">₹{Number(summary.nextEmiAmount || 0).toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
            <Calendar size={13} className="text-blue-600" />
            Due: {summary.nextDueDate ? new Date(summary.nextDueDate).toLocaleDateString('en-IN') : 'N/A'}
          </div>
        </Card>
      </div>

      {loans.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Banknote size={40} className="mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Disbursed Loans Found</h3>
          <p className="text-xs text-slate-500">Your loan applications will automatically generate monthly EMI schedules once approved and disbursed.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          
          {/* Active Loans Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {loans.map((loan) => (
              <button
                key={loan._id}
                onClick={() => setSelectedLoanId(loan._id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  selectedLoanId === loan._id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Landmark size={16} />
                <span>{loan.loanProductId?.name || 'Loan'} ({loan.applicationId})</span>
              </button>
            ))}
          </div>

          {/* Schedule Table Card */}
          <Card padding={false} className="overflow-hidden border-slate-200">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" /> Monthly Installment Schedule
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {activeSchedules.filter((s) => s.status === 'PAID').length} of {activeSchedules.length} Completed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Inst. #</th>
                    <th className="px-6 py-3.5">Due Date</th>
                    <th className="px-6 py-3.5">EMI Amount</th>
                    <th className="px-6 py-3.5">Principal / Interest</th>
                    <th className="px-6 py-3.5">Remaining Balance</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {activeSchedules.map((item) => {
                    const isPaid = item.status === 'PAID';
                    const isOverdue = item.status === 'OVERDUE';

                    return (
                      <tr key={item._id} className={`hover:bg-slate-50/80 transition-colors ${isOverdue ? 'bg-rose-50/30' : ''}`}>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          #{item.installmentNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Clock size={14} className="text-slate-400" />
                            <span>{new Date(item.dueDate).toLocaleDateString('en-IN')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-black text-blue-700">
                          ₹{Number(item.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          <div>Prin: ₹{Number(item.principalComponent || 0).toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-slate-400">Int: ₹{Number(item.interestComponent || 0).toLocaleString('en-IN')}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-700">
                          ₹{Number(item.remainingBalance || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4">
                          {isPaid ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[11px] px-2.5 py-1 rounded-full font-bold border border-emerald-200">
                              PAID
                            </span>
                          ) : isOverdue ? (
                            <span className="bg-rose-100 text-rose-800 text-[11px] px-2.5 py-1 rounded-full font-bold border border-rose-200">
                              OVERDUE
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[11px] px-2.5 py-1 rounded-full font-bold border border-amber-200">
                              PENDING
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!isPaid ? (
                            <button
                              onClick={() => {
                                setPayingEmi(item);
                                setError(null);
                              }}
                              className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all shadow-xs cursor-pointer ${
                                isOverdue
                                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              Pay EMI Now
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-mono">Ref: {item.paymentTransactionRef?.slice(-6) || 'PAID'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

        </div>
      )}

      {/* Simulated Payment Gateway Modal */}
      {payingEmi && (
        <MockRepaymentGatewayModal
          emiItem={{
            _id: payingEmi._id,
            installmentNumber: payingEmi.installmentNumber,
            totalInstallmentAmount: payingEmi.amount,
          }}
          onClose={() => setPayingEmi(null)}
          onSuccess={() => {
            setPayingEmi(null);
            fetchMyEmiSchedule();
          }}
        />
      )}

    </div>
  );
};

export default RepaymentEmiPage;
