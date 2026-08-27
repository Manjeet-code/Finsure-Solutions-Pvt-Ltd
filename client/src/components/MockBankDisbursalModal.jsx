import React, { useState } from 'react';
import { Landmark, X, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import api from '../lib/axios';

const MockBankDisbursalModal = ({ application, onClose, onSuccess }) => {
  const [accountHolderName, setAccountHolderName] = useState(
    application?.applicantDetails?.fullName || application?.citizenId?.name || ''
  );
  const [bankName, setBankName] = useState(
    application?.disbursementAccountDetails?.bankName || 'State Bank of India'
  );
  const [accountNumber, setAccountNumber] = useState(
    application?.disbursementAccountDetails?.accountNumber || '998877665544'
  );
  const [ifscCode, setIfscCode] = useState(
    application?.disbursementAccountDetails?.ifscCode || 'SBIN0001234'
  );
  const [amount, setAmount] = useState(
    application?.approvedAmount || application?.amount || 500000
  );

  const [step, setStep] = useState('FORM'); // 'FORM' | 'PROCESSING' | 'SUCCESS' | 'ERROR'
  const [processStep, setProcessStep] = useState(0);
  const [gatewayResult, setGatewayResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const requestPayloadJSON = JSON.stringify({
    gateway: 'MOCK FINTECH BANK GATEWAY SERVICE',
    applicationId: application?.applicationId || application?._id,
    beneficiary: {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
    },
    amount: Number(amount),
    currency: 'INR',
    settlementMode: 'NEFT_RTGS',
    requestedAt: new Date().toISOString(),
  }, null, 2);

  const handleExecuteDisbursal = async (e) => {
    e.preventDefault();
    setStep('PROCESSING');
    setProcessStep(1);

    try {
      // Step 1: Core Banking Switch Connection
      await new Promise((r) => setTimeout(r, 600));
      setProcessStep(2);

      // Step 2: Beneficiary Account Verification
      await new Promise((r) => setTimeout(r, 600));
      setProcessStep(3);

      // Step 3: Execute API Disbursal Request
      const res = await api.post('/payments/mock-bank-disburse', {
        applicationId: application._id,
        bankName,
        accountNumber,
        ifscCode,
        accountHolderName,
        disburseAmount: Number(amount),
      });

      setProcessStep(4);
      await new Promise((r) => setTimeout(r, 600));

      const payload = res.data?.data || res.data;
      setGatewayResult(payload);
      setStep('SUCCESS');
      if (onSuccess) onSuccess(payload);
    } catch (err) {
      console.error('Mock bank disburse error:', err);
      setErrorMessage(err.response?.data?.message || 'Bank gateway execution failed');
      setStep('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                SIMULATED INTEGRATION
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-1">
              <Landmark size={20} className="text-emerald-600" /> Mock Fintech Bank Disbursal Gateway
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-center gap-2">
          <AlertCircle size={16} className="text-amber-600 shrink-0" />
          <span>
            <strong>Clearly Labelled Mock Integration:</strong> Demonstrates real-time request/response payload validation, gateway latency simulation, and DB sync.
          </span>
        </div>

        {/* STEP 1: FORM & PAYLOAD DEBUGGER */}
        {step === 'FORM' && (
          <form onSubmit={handleExecuteDisbursal} className="space-y-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">IFSC Code *</label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Disbursal Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-emerald-700 text-base focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Gateway JSON Request Terminal */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Terminal size={12} /> Outgoing Gateway Request Payload (JSON)
              </span>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-32 border border-slate-800">
                {requestPayloadJSON}
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer">
                <Landmark size={14} /> Execute Mock Bank Disbursal
              </Button>
            </div>
          </form>
        )}

        {/* STEP 2: SIMULATED LATENCY & STEP ANIMATION */}
        {step === 'PROCESSING' && (
          <div className="py-8 space-y-6 text-center my-auto">
            <Loader2 size={40} className="animate-spin text-emerald-600 mx-auto" />
            <h4 className="text-base font-black text-slate-900">Executing Core Banking Gateway Settlement...</h4>

            <div className="max-w-md mx-auto space-y-2 text-xs text-left">
              <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold ${
                processStep >= 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <CheckCircle2 size={16} className={processStep >= 1 ? 'text-emerald-600' : 'text-slate-300'} />
                Step 1: Connecting to Core Banking Switch (NEFT/RTGS)...
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold ${
                processStep >= 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <CheckCircle2 size={16} className={processStep >= 2 ? 'text-emerald-600' : 'text-slate-300'} />
                Step 2: Validating Beneficiary Account ({ifscCode})...
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold ${
                processStep >= 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <CheckCircle2 size={16} className={processStep >= 3 ? 'text-emerald-600' : 'text-slate-300'} />
                Step 3: Transferring ₹{Number(amount).toLocaleString('en-IN')} to Beneficiary...
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-bold ${
                processStep >= 4 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <CheckCircle2 size={16} className={processStep >= 4 ? 'text-emerald-600' : 'text-slate-300'} />
                Step 4: Synchronizing Database Ledger & EMI Schedule...
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS & RESPONSE JSON TERMINAL */}
        {step === 'SUCCESS' && gatewayResult && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Disbursal Settled & Database Synchronized!</h4>
                <p className="text-xs text-emerald-700">
                  Transaction ID: <strong className="font-mono">{gatewayResult.gatewayResponse?.transactionId}</strong>
                </p>
              </div>
            </div>

            {/* Gateway Response JSON Terminal */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Terminal size={12} /> Incoming Bank Response Payload (JSON)
              </span>
              <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto max-h-48 border border-slate-800">
                {JSON.stringify(gatewayResult.gatewayResponse, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button onClick={onClose} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
                Close Gateway Terminal
              </Button>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {step === 'ERROR' && (
          <div className="py-6 space-y-4 text-center">
            <AlertCircle size={36} className="text-rose-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Mock Bank Disbursal Failed</h4>
            <p className="text-xs text-rose-600">{errorMessage}</p>
            <Button onClick={() => setStep('FORM')} variant="outline" className="text-xs font-bold">
              Try Again
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MockBankDisbursalModal;
