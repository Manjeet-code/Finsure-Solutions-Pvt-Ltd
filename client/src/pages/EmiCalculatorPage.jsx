import React, { useState } from 'react';
import { Calculator, ArrowRight, CheckCircle2, DollarSign, PieChart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const EmiCalculatorPage = () => {
  const [amount, setAmount] = useState(500000); // Principal ₹5,00,000
  const [rate, setRate] = useState(9.5); // 9.5% p.a.
  const [tenureYears, setTenureYears] = useState(5); // 5 years

  // EMI Calculation Formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const principal = Number(amount) || 0;
  const monthlyRate = Number(rate) / 12 / 100;
  const totalMonths = Number(tenureYears) * 12;

  let emi = 0;
  if (principal > 0 && monthlyRate > 0 && totalMonths > 0) {
    emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const monthlyEmi = Math.round(emi);
  const totalPayment = Math.round(monthlyEmi * totalMonths);
  const totalInterest = Math.max(0, totalPayment - principal);
  const interestPercentage = totalPayment > 0 ? Math.round((totalInterest / totalPayment) * 100) : 0;
  const principalPercentage = 100 - interestPercentage;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 text-blue-800 font-bold text-xs uppercase tracking-wider">
            <Calculator size={16} /> Interactive Financial Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Loan EMI Calculator
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Calculate your exact monthly EMI repayment, total interest payable, and payment schedule instantly.
          </p>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Form Column */}
          <Card className="lg:col-span-7 space-y-6 p-6 sm:p-8">
            
            {/* Amount Slider & Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loan Amount</label>
                <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <span className="text-sm font-extrabold text-blue-900">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(10000, Number(e.target.value)))}
                    className="w-28 text-right font-black text-blue-950 bg-transparent focus:outline-none text-base"
                  />
                </div>
              </div>
              <input
                type="range"
                min="50000"
                max="10000000"
                step="50000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>₹50,000</span>
                <span>₹50 Lakhs</span>
                <span>₹1 Crore</span>
              </div>
            </div>

            {/* Interest Rate Slider & Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Interest Rate (% p.a.)</label>
                <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <input
                    type="number"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(Math.max(1, Number(e.target.value)))}
                    className="w-16 text-right font-black text-blue-950 bg-transparent focus:outline-none text-base"
                  />
                  <span className="text-sm font-bold text-slate-600">%</span>
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="24"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>5%</span>
                <span>12%</span>
                <span>24%</span>
              </div>
            </div>

            {/* Tenure Slider & Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Loan Tenure (Years)</label>
                <div className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                  <input
                    type="number"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Math.max(1, Number(e.target.value)))}
                    className="w-14 text-right font-black text-blue-950 bg-transparent focus:outline-none text-base"
                  />
                  <span className="text-xs font-bold text-slate-600">Yr</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>1 Year ({12} Mos)</span>
                <span>15 Years ({180} Mos)</span>
                <span>30 Years ({360} Mos)</span>
              </div>
            </div>

          </Card>

          {/* Results Summary Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 sm:p-8 space-y-6 shadow-xl border-none">
              
              <div className="text-center pb-6 border-b border-white/10">
                <span className="text-xs uppercase tracking-widest text-blue-300 font-bold block mb-1">
                  Monthly EMI Payable
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  ₹{monthlyEmi.toLocaleString('en-IN')}
                </div>
                <span className="text-xs text-blue-200 mt-1 block">for {totalMonths} months</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-blue-200 text-xs">Principal Amount:</span>
                  <span className="font-bold text-white">₹{principal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-blue-200 text-xs">Total Interest Payable:</span>
                  <span className="font-bold text-amber-300">₹{totalInterest.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 pt-2 border-t border-white/10 font-bold">
                  <span className="text-white text-xs">Total Amount Payable:</span>
                  <span className="text-emerald-400 text-base">₹{totalPayment.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Progress Breakdown Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-blue-200 font-medium">
                  <span>Principal ({principalPercentage}%)</span>
                  <span>Interest ({interestPercentage}%)</span>
                </div>
                <div className="h-3 w-full bg-blue-950 rounded-full overflow-hidden flex border border-white/10">
                  <div style={{ width: `${principalPercentage}%` }} className="bg-blue-500 h-full"></div>
                  <div style={{ width: `${interestPercentage}%` }} className="bg-amber-400 h-full"></div>
                </div>
              </div>

              <Link to="/register" className="block pt-2">
                <Button className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2">
                  Apply for ₹{principal.toLocaleString('en-IN')} <ArrowRight size={18} />
                </Button>
              </Link>

            </Card>

            <div className="p-4 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-500 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-600" /> FinSure Rate Guarantee
              </div>
              <p>Rates and EMI figures are indicative estimates. Final approval depends on documentation and branch manager verification.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EmiCalculatorPage;
