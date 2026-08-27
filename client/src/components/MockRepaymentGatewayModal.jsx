import React, { useState } from 'react';
import { CreditCard, Smartphone, Landmark, CheckCircle2, Loader2, X, AlertCircle, Terminal } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import api from '../lib/axios';

const MockRepaymentGatewayModal = ({ emiItem, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // 'UPI' | 'NET_BANKING' | 'CARD'
  const [upiId, setUpiId] = useState('citizen@upi');
  const [netBankingBank, setNetBankingBank] = useState('State Bank of India');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');

  const [step, setStep] = useState('FORM'); // 'FORM' | 'PROCESSING' | 'SUCCESS' | 'ERROR'
  const [gatewayResult, setGatewayResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleExecutePayment = async (e) => {
    e.preventDefault();
    setStep('PROCESSING');

    try {
      await new Promise((r) => setTimeout(r, 1200));

      const res = await api.post('/payments/mock-repayment', {
        emiScheduleId: emiItem._id,
        paymentMethod,
        upiId: paymentMethod === 'UPI' ? upiId : undefined,
        cardNumber: paymentMethod === 'CARD' ? cardNumber : undefined,
        netBankingBank: paymentMethod === 'NET_BANKING' ? netBankingBank : undefined,
        amount: emiItem.totalInstallmentAmount,
      });

      const payload = res.data?.data || res.data;
      setGatewayResult(payload);
      setStep('SUCCESS');
      if (onSuccess) onSuccess(payload);
    } catch (err) {
      console.error('Mock repayment error:', err);
      setErrorMessage(err.response?.data?.message || 'Mock payment gateway processing failed');
      setStep('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-full">
              SIMULATED REPAYMENT GATEWAY
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              Pay Installment #{emiItem?.installmentNumber || 1}
            </h3>
            <p className="text-xs text-slate-500 font-mono">Amount Due: ₹{Number(emiItem?.totalInstallmentAmount || 0).toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: FORM */}
        {step === 'FORM' && (
          <form onSubmit={handleExecutePayment} className="space-y-4 text-xs">
            
            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold cursor-pointer transition-all ${
                  paymentMethod === 'UPI' ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/20' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Smartphone size={18} /> Mock UPI
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('NET_BANKING')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold cursor-pointer transition-all ${
                  paymentMethod === 'NET_BANKING' ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/20' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <Landmark size={18} /> NetBanking
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold cursor-pointer transition-all ${
                  paymentMethod === 'CARD' ? 'bg-indigo-50 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/20' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <CreditCard size={18} /> Debit Card
              </button>
            </div>

            {/* Dynamic Inputs */}
            {paymentMethod === 'UPI' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Simulated UPI ID *</label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. name@gpay or citizen@upi"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {paymentMethod === 'NET_BANKING' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Bank *</label>
                <select
                  value={netBankingBank}
                  onChange={(e) => setNetBankingBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Simulated Card Number *</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer">
                Confirm Mock Payment (₹{Number(emiItem?.totalInstallmentAmount || 0).toLocaleString('en-IN')})
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: PROCESSING */}
        {step === 'PROCESSING' && (
          <div className="py-8 text-center space-y-4">
            <Loader2 size={36} className="animate-spin text-indigo-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Processing Mock Gateway Payment...</h4>
            <p className="text-xs text-slate-500">Validating transaction & updating repayment schedule.</p>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'SUCCESS' && gatewayResult && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">EMI Payment Successful!</h4>
                <p className="text-emerald-700 text-[11px]">
                  Txn ID: <strong className="font-mono">{gatewayResult.gatewayRes?.transactionId}</strong>
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 text-emerald-400 font-mono rounded-xl space-y-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                <Terminal size={12} /> Gateway Response Payload
              </div>
              <pre className="text-[11px] overflow-x-auto">
                {JSON.stringify(gatewayResult.gatewayRes, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={onClose} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
                Close Gateway
              </Button>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {step === 'ERROR' && (
          <div className="py-6 space-y-4 text-center text-xs">
            <AlertCircle size={32} className="text-rose-600 mx-auto" />
            <p className="text-rose-600 font-bold">{errorMessage}</p>
            <Button onClick={() => setStep('FORM')} variant="outline">Try Again</Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MockRepaymentGatewayModal;
