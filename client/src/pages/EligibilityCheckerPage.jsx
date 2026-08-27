import React, { useState } from 'react';
import { CheckSquare, ArrowRight, ShieldCheck, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const EligibilityCheckerPage = () => {
  const [monthlyIncome, setMonthlyIncome] = useState(75000);
  const [existingEmi, setExistingEmi] = useState(10000);
  const [employmentType, setEmploymentType] = useState('Salaried');
  const [selectedProduct, setSelectedProduct] = useState('Personal Loan');
  const [cibilScore, setCibilScore] = useState(750);

  // Calculation Logic:
  // FOIR (Fixed Obligation to Income Ratio) max = 50% for income < 50k, 60% for income >= 50k
  const income = Number(monthlyIncome) || 0;
  const currentEmi = Number(existingEmi) || 0;
  const foirLimit = income >= 50000 ? 0.60 : 0.50;

  const maxMonthlyEmiCapacity = Math.max(0, (income * foirLimit) - currentEmi);
  
  // Approximate loan amount calculation based on 10.5% interest over 5 years (60 months factor ~ 46x monthly EMI)
  const estimatedMaxLoanAmount = Math.round(maxMonthlyEmiCapacity * 46);

  const getApprovalRating = () => {
    if (cibilScore >= 750 && maxMonthlyEmiCapacity > 10000) {
      return { text: 'High Approval Chance', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: ShieldCheck };
    }
    if (cibilScore >= 650 && maxMonthlyEmiCapacity > 5000) {
      return { text: 'Moderate Approval Chance', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: TrendingUp };
    }
    return { text: 'Manual Underwriting Required', color: 'bg-slate-100 text-slate-700 border-slate-300', icon: AlertCircle };
  };

  const rating = getApprovalRating();
  const RatingIcon = rating.icon;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/70 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <CheckSquare size={16} /> Instant Qualification Tool
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Loan Eligibility Checker
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto font-medium">
            Check your maximum pre-approved loan amount and eligible EMI capacity in under 60 seconds.
          </p>
        </div>

        {/* Checker Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Inputs Card */}
          <Card className="md:col-span-7 space-y-5 p-6 sm:p-8">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Net Monthly Income (₹)
              </label>
              <input
                type="number"
                step="5000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Math.max(10000, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Existing Monthly Obligations / EMIs (₹)
              </label>
              <input
                type="number"
                step="1000"
                value={existingEmi}
                onChange={(e) => setExistingEmi(Math.max(0, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Employment Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Salaried">Salaried Employee</option>
                  <option value="Self-Employed">Self-Employed Professional</option>
                  <option value="Business">Business Owner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Loan Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Auto Loan">Auto Loan</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estimated CIBIL Score</label>
                <span className="text-sm font-black text-blue-700">{cibilScore}</span>
              </div>
              <input
                type="range"
                min="300"
                max="900"
                step="10"
                value={cibilScore}
                onChange={(e) => setCibilScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>300 (Poor)</span>
                <span>650 (Fair)</span>
                <span>750+ (Excellent)</span>
              </div>
            </div>

          </Card>

          {/* Results Summary Card */}
          <div className="md:col-span-5 space-y-6">
            <Card className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white p-6 sm:p-8 space-y-6 shadow-xl border-none">
              
              <div className="text-center pb-6 border-b border-white/10">
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold block mb-1">
                  Maximum Eligible Loan Amount
                </span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  ₹{estimatedMaxLoanAmount.toLocaleString('en-IN')}
                </div>
                <span className="text-xs text-emerald-200 mt-1 block">for {selectedProduct}</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-300 text-xs">Max Monthly EMI Capacity:</span>
                  <span className="font-bold text-white">₹{Math.round(maxMonthlyEmiCapacity).toLocaleString('en-IN')}/mo</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-300 text-xs">Assumed FOIR Limit:</span>
                  <span className="font-bold text-emerald-300">{foirLimit * 100}% of Income</span>
                </div>
              </div>

              {/* Status Rating Badge */}
              <div className={`p-3 rounded-xl border ${rating.color} flex items-center gap-2.5 text-xs font-bold`}>
                <RatingIcon size={18} />
                <span>{rating.text}</span>
              </div>

              <Link to="/register" className="block pt-2">
                <Button className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2">
                  Apply Now <ArrowRight size={18} />
                </Button>
              </Link>

            </Card>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EligibilityCheckerPage;
