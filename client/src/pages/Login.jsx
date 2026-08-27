import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, Briefcase, ShieldCheck, Home as HomeIcon } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import ForgotPasswordModal from '../components/ForgotPasswordModal';

const services = [
  { icon: User, title: 'Personal Loans', desc: 'Instant approval up to ₹10 Lakhs', color: 'from-blue-600 to-indigo-600' },
  { icon: Briefcase, title: 'Business Finance', desc: 'Working capital & expansion loans up to ₹2 Crore', color: 'from-emerald-600 to-teal-600' },
  { icon: ShieldCheck, title: 'Life & Health Insurance', desc: 'Comprehensive protection for family & business', color: 'from-purple-600 to-indigo-600' },
  { icon: HomeIcon, title: 'Home Loans', desc: 'Rates starting from 8.35%*', color: 'from-amber-500 to-orange-600' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email, password);
      const role = (data.role || '').toUpperCase();
      if (role === 'ADMIN' || role === 'SUPER ADMIN') {
        navigate('/admin');
      } else if (role === 'BRANCH MANAGER' || role === 'BRANCH_MANAGER') {
        navigate('/manager');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      
      {/* Left Column: FinSure Brand Showcase */}
      <div className="hidden lg:flex lg:flex-1 bg-[#0B192C] relative overflow-hidden flex-col justify-center items-center p-12 border-r border-slate-800">
        
        {/* Logo in top left */}
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-3 z-20 group">
          <div className="flex items-center justify-center p-1 bg-slate-900 rounded-xl border border-slate-800 shadow-sm shrink-0">
            <img src="/logo.png" alt="FinSure Logo" className="h-8 w-8 object-contain rounded-lg" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-black text-white tracking-tight leading-none">FinSure</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-0.5">Solutions Pvt. Ltd.</span>
          </div>
        </Link>

        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="text-left mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 block mb-2">
              WELCOME BACK TO FINSURE
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
              Empowering Your Dreams. <br />
              Building a Stronger <span className="text-blue-500">Tomorrow</span>
            </h3>
            <p className="text-slate-400 text-sm font-medium">
              Access your loan portal, track approvals, and manage repayments seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {services.map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + (idx * 0.1) }}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 shadow-md"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shrink-0 shadow-md`}>
                  <service.icon className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{service.title}</h4>
                  <p className="text-slate-400 text-xs">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md lg:w-[440px]"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
            {/* Top Accent Indicator */}
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

            <div className="mb-8 text-center">
              <Link to="/" className="inline-flex items-center gap-3 mb-5 group">
                <div className="flex items-center justify-center p-1 bg-slate-50 rounded-xl border border-slate-200/80 shadow-xs">
                  <img src="/logo.png" alt="FinSure Logo" className="h-9 w-9 object-contain rounded-lg" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">FinSure</span>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">Solutions Pvt. Ltd.</span>
                </div>
              </Link>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">Log in to your account to manage your loans</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-5 text-xs font-bold border border-red-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
                />
              </div>

              <div>
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
                />
              </div>
              
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs font-medium text-slate-600 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-3.5 mt-4 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 rounded-xl"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight size={18} />}
              </Button>
            </form>

            {/* Quick Demo Accounts Selection */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Quick Test Credentials:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDemoUser('branchmanager.lucknow@finsure.in', '123456')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-semibold text-[11px] border border-slate-200 text-center truncate"
                >
                  Branch Manager
                </button>
                <button
                  type="button"
                  onClick={() => setDemoUser('admin@finsure.in', '123456')}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-semibold text-[11px] border border-slate-200 text-center truncate"
                >
                  Super Admin
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs font-medium text-slate-500 pt-4 border-t border-slate-100">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Create an account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
};

export default Login;
