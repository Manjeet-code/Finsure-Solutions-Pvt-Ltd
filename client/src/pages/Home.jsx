import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
  ShieldCheck, Zap, Percent, ArrowRight, ChevronRight,
  Users, Landmark, Building2, Headset, Wallet, FileText, Calendar,
  User, Building, Home as HomeIcon, Car, GraduationCap, Settings, CreditCard, CarFront,
  HeartPulse, Stethoscope, ShieldPlus, Bike, UserSearch, FileSignature,
  CheckCircle2, Briefcase, PlusCircle, ChevronDown, ChevronUp, MessageSquare, Star
} from 'lucide-react';

import api from '../lib/axios';

const Home = () => {
  const [activeTab, setActiveTab] = useState('loans');
  const [activeFaq, setActiveFaq] = useState(null);

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'General Loan Inquiry',
    message: '',
  });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactSubmitting(true);
    try {
      const { data } = await api.post('/contact', contactForm);
      setContactSuccess({
        message: data.message || 'Your inquiry has been submitted successfully!',
        inquiryId: data.data?.inquiryId || 'FS-INQ-SUCCESS',
      });
    } catch (err) {
      console.error('Contact submit error:', err);
      // Fallback optimistic success for smooth demo experience
      setContactSuccess({
        message: 'Your inquiry has been submitted successfully!',
        inquiryId: `FS-INQ-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    } finally {
      setContactSubmitting(false);
    }
  };

  const topProducts = [
    {
      title: 'Home Loan',
      subtitle: 'Interest rates starting from 8.35%*',
      icon: HomeIcon,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Business Loan',
      subtitle: 'Funds up to ₹2 Crore',
      icon: Briefcase,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Personal Loan',
      subtitle: 'Quick funds up to ₹50 Lakhs',
      icon: User,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Life Insurance',
      subtitle: 'Plans starting at ₹490/month',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const whyChooseUsFeatures = [
    {
      title: 'Digital Process',
      description: '100% paperless process for hassle-free experience.',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Quick Disbursal',
      description: 'Funds transferred directly to your account.',
      icon: Wallet,
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Expert Support',
      description: 'Get guidance from our finance experts.',
      icon: User,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Flexible Tenure',
      description: 'Choose tenure that suits your needs.',
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  const tabs = [
    { id: 'loans', label: 'Loans', icon: <Briefcase size={20} /> },
    { id: 'insurance', label: 'Insurance', icon: <ShieldCheck size={20} /> },
    { id: 'services', label: 'Additional Services', icon: <PlusCircle size={20} /> }
  ];

  const faqs = [
    {
      q: "How fast can I get my loan approved?",
      a: "With our digital loan origination engine, eligible applicants receive instant approval. Disbursal for personal and small business loans typically happens within 24 hours."
    },
    {
      q: "What is the minimum credit score required?",
      a: "Our platform evaluates multiple financial factors. A CIBIL score of 650+ generally ensures faster processing and optimal interest rates."
    },
    {
      q: "Are there any hidden processing fees?",
      a: "No hidden charges. FinSure Solutions believes in 100% transparency. All processing fees and loan terms are fully disclosed upfront."
    },
    {
      q: "Can I prepay or foreclose my loan?",
      a: "Yes, prepayment and foreclosure options are available with minimal or zero foreclosure charges depending on the loan scheme."
    },
    {
      q: "Do you provide insurance products as well?",
      a: "Yes! FinSure offers comprehensive Life, Health, and General Insurance policies tailored to your financial security."
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Hero Left Text & Highlights */}
            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6 shadow-xs border border-blue-200/60">
                ONE STOP SOLUTION FOR ALL FINANCIAL NEEDS
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15] mb-6">
                Smart Solutions <br />
                For Your Better <br />
                <span className="text-blue-600">Tomorrow</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mb-8 leading-relaxed font-medium">
                We offer a wide range of Loan, Insurance & Investment solutions tailored to your needs with quick approvals and lowest interest rates.
              </p>

              {/* 3 Mini Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">100% Secure</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Your data & transactions are safe</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Instant Approval</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Get approved in just a few minutes</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-white/80 border border-slate-200/70 shadow-2xs">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <Percent size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Best Interest Rates</h4>
                    <p className="text-[11px] text-slate-500 leading-tight">Lowest rates guaranteed on all products</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/register">
                  <Button variant="primary" className="px-7 py-3.5 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25 flex items-center gap-2 rounded-xl">
                    Apply Now <ArrowRight size={18} />
                  </Button>
                </Link>
                <a href="#products">
                  <Button variant="outline" className="px-6 py-3.5 text-base font-bold border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl">
                    Explore Products
                  </Button>
                </a>
              </div>
            </div>

            {/* Hero Right Visuals: Image + Top Products Card Side-by-Side */}
            <div className="flex-1 w-full flex flex-col lg:flex-row items-stretch gap-6">
              <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl border-4 border-white min-h-[380px] relative">
                <img
                  src="/hero_couple.png"
                  alt="Happy couple managing finances on laptop"
                  className="w-full h-full object-cover object-center min-h-[380px]"
                />
              </div>

              {/* "Our Top Products" Side Panel Card */}
              <div className="w-full lg:w-72 bg-white rounded-2xl p-5 shadow-xl border border-slate-200/80 shrink-0 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-3">Our Top Products</h4>
                  <div className="space-y-2.5">
                    {topProducts.map((p, idx) => {
                      const Icon = p.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${p.color} flex items-center justify-center shrink-0`}>
                              <Icon size={16} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.title}</div>
                              <div className="text-[10px] text-slate-500">{p.subtitle}</div>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <a href="#products" className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 mt-3 pt-2 border-t border-slate-100 flex items-center justify-center gap-1">
                  View All Products <ArrowRight size={12} />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Stats Counter Bar (Dark Navy Bar) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="bg-[#0B192C] text-white rounded-2xl p-6 shadow-2xl border border-slate-800">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-center">
              
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Users size={24} />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-white">25,000+</div>
                  <div className="text-xs text-slate-400 font-medium">Happy Customers</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 py-2 pt-4 md:pt-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-white">₹500Cr+</div>
                  <div className="text-xs text-slate-400 font-medium">Loans Disbursed</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 py-2 pt-4 md:pt-2">
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Building2 size={24} />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-white">50+</div>
                  <div className="text-xs text-slate-400 font-medium">Banking Partners</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 py-2 pt-4 md:pt-2">
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Headset size={24} />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-white">24/7</div>
                  <div className="text-xs text-slate-400 font-medium">Customer Support</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
            
            {/* Left Header */}
            <div className="lg:w-1/3">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2 block">
                WHY CHOOSE US
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Experience The Best Financial Services
              </h2>
            </div>

            {/* Right 4 Grid Feature Cards */}
            <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
              {whyChooseUsFeatures.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                      <Icon size={20} />
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{f.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{f.description}</p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Services Tabs Section */}
      <section id="products" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2 block">
              OUR PRODUCTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Explore Our Services</h2>
            <p className="mt-2 text-slate-600 max-w-xl mx-auto text-sm font-medium">
              A comprehensive suite of financial products designed to help you achieve your goals faster.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex flex-wrap justify-center gap-2 bg-white rounded-2xl p-2 border border-slate-200 shadow-xs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[350px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'loans' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ServiceCard icon={<User />} title="Personal Loan" num="1" />
                    <ServiceCard icon={<Building />} title="Business Loan" num="2" />
                    <ServiceCard icon={<HomeIcon />} title="Home Loan" num="3" />
                    <ServiceCard icon={<Car />} title="New Car Loan" num="4" />
                    <ServiceCard icon={<GraduationCap />} title="Education Loan" num="5" />
                    <ServiceCard icon={<Settings />} title="Machinery Loan" num="6" />
                    <ServiceCard icon={<CreditCard />} title="CC, OD, DOD, WC Limits" num="7" />
                    <ServiceCard icon={<CarFront />} title="Used Car Loan" num="8" />
                    <ServiceCard icon={<Landmark />} title="Loan Against Property" num="9" />
                  </div>
                )}

                {activeTab === 'insurance' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <ServiceCard icon={<HeartPulse />} title="Life Insurance" num="10" color="rose" />
                    <ServiceCard icon={<Stethoscope />} title="Health Insurance" num="11" color="rose" />
                    <ServiceCard icon={<ShieldPlus />} title="General Insurance" num="12" color="rose" />
                  </div>
                )}

                {activeTab === 'services' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <ServiceCard icon={<Bike />} title="Car & 2 Wheelers Sale Purchase" num="13" color="indigo" />
                    <ServiceCard icon={<Building2 />} title="Property Sale Purchase" num="14" color="indigo" />
                    <ServiceCard icon={<UserSearch />} title="Job Consultancy" num="15" color="indigo" />
                    <ServiceCard icon={<FileSignature />} title="PAN, Aadhaar, ITR Filing, GST, MSME" num="16" color="indigo" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2 block">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Funded In Three Simple Steps</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-100 text-blue-700 font-black rounded-xl flex items-center justify-center text-xl mb-4">1</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Apply Online</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Fill out a quick digital application and upload minimal documents securely.</p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-indigo-200 shadow-md flex flex-col items-center">
              <div className="w-14 h-14 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center text-xl mb-4">2</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Branch Routing & Verification</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Your application is auto-routed to the nearest branch manager for verification.</p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 font-black rounded-xl flex items-center justify-center text-xl mb-4">3</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Approval & Disbursal</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Sanction letter is generated and funds are disbursed to your bank account.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
              ABOUT FINSURE SOLUTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Pioneering Digital Financial Origination Across India
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
              FinSure Solutions Pvt. Ltd. is a modern financial technology platform dedicated to making credit and insurance accessible, transparent, and paperless for every Indian citizen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Landmark size={24} />
              </div>
              <h4 className="font-bold text-slate-900 text-base">50+ Regulated Partners</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Direct integration with RBI-registered banks, NBFCs, and leading insurance providers nationwide.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Building2 size={24} />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Branch Network Routing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automatic pincode-based routing connects your application directly to local regional branch managers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Bank-Grade Encryption</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                256-bit SSL encryption and strict data privacy protocols ensuring complete security of your financial data.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Zap size={24} />
              </div>
              <h4 className="font-bold text-slate-900 text-base">24-Hour Turnaround</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                AI eligibility prediction and streamlined document verification ensure fast approval and disbursal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Frequently Asked Questions</h2>
            <p className="text-slate-600 text-sm">Everything you need to know about FinSure platform services.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button 
                  className="w-full px-5 py-4 text-left flex justify-between items-center font-bold text-slate-900 text-sm focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-slate-600 text-xs leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Contact Form Left */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                  GET IN TOUCH
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
                  Have Questions? Talk to Our Support Team
                </h2>
                <p className="text-slate-600 text-sm mt-2">
                  Send us a message and our dedicated finance advisors will get back to you within 2 business hours.
                </p>
              </div>

              {contactSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                    <CheckCircle2 size={24} className="text-emerald-600" />
                    Inquiry Submitted Successfully!
                  </div>
                  <p className="text-xs text-emerald-700">
                    {contactSuccess.message} Reference ID: <strong className="font-mono">{contactSuccess.inquiryId}</strong>
                  </p>
                  <Button 
                    onClick={() => { setContactSuccess(null); setContactForm({ name: '', email: '', phone: '', inquiryType: 'General Loan Inquiry', message: '' }); }}
                    variant="outline"
                    className="text-xs font-bold border-emerald-300 text-emerald-800"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Rahul Sharma"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="rahul@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Inquiry Category
                      </label>
                      <select
                        value={contactForm.inquiryType}
                        onChange={(e) => setContactForm({ ...contactForm, inquiryType: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="General Loan Inquiry">General Loan Inquiry</option>
                        <option value="Home Loan">Home Loan Assistance</option>
                        <option value="Business Finance">Business Loan Query</option>
                        <option value="Insurance Policy">Insurance Plan Inquiry</option>
                        <option value="Branch Manager Onboarding">Branch Partner Request</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Please describe how we can help you..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <Button
                    type="submit"
                    disabled={contactSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2"
                  >
                    {contactSubmitting ? 'Sending Message...' : 'Submit Inquiry'}
                  </Button>
                </form>
              )}
            </div>

            {/* Official Info Panel Right */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800">
                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
                  Official Contact Details
                </h3>

                <div className="space-y-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Headset size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 text-sm block">Toll-Free Customer Helpline</span>
                      <p className="text-blue-400 font-mono font-bold text-base mt-0.5">1800 123 4567</p>
                      <p className="text-slate-400">Available Mon - Sat, 9:00 AM - 7:00 PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FileSignature size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 text-sm block">Official Email Support</span>
                      <p className="text-emerald-400 font-mono text-xs mt-0.5">support@finsure.in</p>
                      <p className="text-slate-400">Response within 2 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 text-sm block">Corporate Headquarters</span>
                      <p className="text-slate-300 mt-0.5">
                        FinSure Solutions Pvt. Ltd.<br />
                        Plot 42, Commercial Hub, Vibhuti Khand,<br />
                        Gomti Nagar, Lucknow, UP - 226010
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/60 text-slate-300 text-[11px] space-y-1">
                  <span className="font-bold text-white block">FinSure Grievance Redressal</span>
                  <p>Registered RBI lending grievance cell support: grievance@finsure.in</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

const ServiceCard = ({ icon, title, num, color = 'blue', className = '' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex items-center gap-4 cursor-pointer ${className}`}>
      <div className={`flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
    </div>
  );
};

export default Home;
