import React from 'react';
import { BookOpen, ShieldCheck, CheckCircle2, ArrowRight, FileText, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const FinancialGuidesPage = () => {
  const guides = [
    {
      id: 1,
      category: 'Credit & CIBIL',
      title: '5 Proven Steps to Boost Your CIBIL Score Above 750',
      description: 'Learn how timely repayments, credit utilization ratios, and credit mix impact your score and unlock lower interest rates.',
      readTime: '4 min read',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 2,
      category: 'Home Loans',
      title: 'Complete Home Loan Buyer Checklist: Fees, Rates & Agreements',
      description: 'Everything you need to know about floating vs fixed interest rates, processing charges, and property title verification.',
      readTime: '6 min read',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 3,
      category: 'Business Finance',
      title: 'How Small Businesses Can Secure Working Capital Loans Quickly',
      description: 'Understanding GST returns, P&L audit requirements, and MSME subsidy schemes for hassle-free business expansion.',
      readTime: '5 min read',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    },
    {
      id: 4,
      category: 'KYC & Documentation',
      title: 'Instant Loan Approval: Required KYC Documents & Verification',
      description: 'Avoid application rejections by organizing PAN, Aadhaar, salary slips, and bank statements before submission.',
      readTime: '3 min read',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/70 text-blue-800 font-bold text-xs uppercase tracking-wider">
            <BookOpen size={16} /> Knowledge Center
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Financial Guides & Smart Borrowing
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Expert insights, borrowing tips, and step-by-step guides to help you make informed financial decisions.
          </p>
        </div>

        {/* Guides List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((g) => (
            <Card key={g.id} className="flex flex-col justify-between hover:shadow-xl transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${g.badgeColor}`}>
                    {g.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{g.readTime}</span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 leading-snug hover:text-blue-600 transition-colors">
                  {g.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {g.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <Link to="/register" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Read Full Guide <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Banner */}
        <Card className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-8 rounded-2xl text-center space-y-4">
          <h3 className="text-2xl font-bold">Ready to Start Your Application?</h3>
          <p className="text-blue-200 text-sm max-w-md mx-auto">
            Apply online in minutes and experience paperless processing with bank-grade security.
          </p>
          <Link to="/register" className="inline-block">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg">
              Apply Now
            </Button>
          </Link>
        </Card>

      </div>
    </div>
  );
};

export default FinancialGuidesPage;
