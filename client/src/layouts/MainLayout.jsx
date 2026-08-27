import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-light">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      
      {/* Premium SaaS Footer */}
      <footer className="bg-slate-950 text-slate-300 pt-20 pb-10 mt-auto relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Pre-footer CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-10 md:p-14 mb-16 shadow-2xl shadow-blue-900/20 flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="text-left relative z-10">
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Ready to transform your finances?</h3>
              <p className="text-blue-100 text-lg max-w-xl">Join thousands of customers who have already experienced the Finsure advantage. Get approved in minutes.</p>
            </div>
            <Link to="/register" className="relative z-10 whitespace-nowrap">
              <button className="bg-white text-blue-700 hover:bg-blue-50 hover:scale-105 font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-all flex items-center gap-2">
                Apply Now <ArrowRight size={20} />
              </button>
            </Link>
          </div>

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Brand Column (Span 4) */}
            <div className="lg:col-span-4 flex flex-col items-start text-left">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center bg-white/10 p-1 rounded-xl shadow-lg border border-white/5">
                  <img src="/logo.png" alt="Finsure Logo" className="h-10 w-10 object-contain rounded-lg" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight leading-none">Finsure</h2>
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-1">Solutions Pvt Ltd</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8 max-w-sm">
                One Stop Solution For All Financial Needs. Experience a modern, digital-first approach to Loans & Insurance with bank-grade security.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500 hover:bg-blue-600 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-400 hover:bg-blue-500 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-pink-500 hover:bg-pink-600 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-700 hover:bg-blue-800 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>
            </div>

            {/* Links Columns (Span 2 each) */}
            <div className="lg:col-span-2 text-left">
              <h4 className="text-white font-bold mb-6 text-lg tracking-wide">Products</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Personal Loans</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Business Loans</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Home Loans</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Life Insurance</a></li>
                <li><a href="#" className="text-slate-400 hover:text-emerald-400 transition-colors">Health Insurance</a></li>
              </ul>
            </div>

            <div className="lg:col-span-2 text-left">
              <h4 className="text-white font-bold mb-6 text-lg tracking-wide">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact Info (Span 4) */}
            <div className="lg:col-span-4 text-left">
              <h4 className="text-white font-bold mb-6 text-lg tracking-wide">Contact Us</h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 shrink-0">
                    <MapPin size={18} />
                  </div>
                  <span className="text-slate-400 mt-1">123 Financial Hub, Tech Park, New Delhi, India 110001</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                    <Phone size={18} />
                  </div>
                  <span className="text-slate-400">9888601876 (Ranjay)</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <Mail size={18} />
                  </div>
                  <span className="text-slate-400">support@finsuresolutions.com</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Finsure Solutions Pvt Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> RBI Registered Partner</span>
              <span className="flex items-center gap-1.5"><Lock size={14} className="text-emerald-500" /> 256-bit Encrypted</span>
            </div>
          </div>

        </div>
      </footer>
      <Chatbot />
    </div>
  );
};

export default MainLayout;
