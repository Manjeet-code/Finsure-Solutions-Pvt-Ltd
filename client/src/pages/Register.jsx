import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, Briefcase, ShieldCheck, Home as HomeIcon } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const services = [
  { icon: User, title: 'Personal Loans', desc: 'Instant approval up to ₹10 Lakhs', color: 'from-blue-600 to-indigo-600' },
  { icon: Briefcase, title: 'Business Finance', desc: 'Working capital & expansion loans up to ₹2 Crore', color: 'from-emerald-600 to-teal-600' },
  { icon: ShieldCheck, title: 'Life & Health Insurance', desc: 'Comprehensive protection for family & business', color: 'from-purple-600 to-indigo-600' },
  { icon: HomeIcon, title: 'Home Loans', desc: 'Rates starting from 8.35%*', color: 'from-amber-500 to-orange-600' },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    setError(null);
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.phone, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
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
              START YOUR FINANCIAL JOURNEY
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-3">
              Unlock Instant Credit. <br />
              Shape Your Financial <span className="text-blue-500">Tomorrow</span>
            </h3>
            <p className="text-slate-400 text-sm font-medium">
              Join thousands of applicants benefiting from paperless loans and instant disbursal.
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

      {/* Right Column: Register Form */}
      <div className="flex-1 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-md lg:w-[440px] my-auto"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10 relative overflow-hidden">
            {/* Top Accent Indicator */}
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>

            <div className="mb-6 text-center">
              <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
                <div className="flex items-center justify-center p-1 bg-slate-50 rounded-xl border border-slate-200/80 shadow-xs">
                  <img src="/logo.png" alt="FinSure Logo" className="h-9 w-9 object-contain rounded-lg" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-2xl font-black text-slate-900 tracking-tight leading-none">FinSure</span>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">Solutions Pvt. Ltd.</span>
                </div>
              </Link>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h2>
              <p className="text-slate-500 text-xs font-medium mt-1">Join FinSure and unlock instant digital loans</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-4 text-xs font-bold border border-red-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <Input
                  label="Full Name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Rahul Sharma"
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
                />
              </div>

              <div>
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="rahul@example.com"
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
                  />
                </div>

                <div>
                  <Input
                    label="Confirm"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="bg-slate-50 border-slate-200 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-full py-3.5 mt-5 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 rounded-xl"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'} {!loading && <ArrowRight size={18} />}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs font-medium text-slate-500 pt-4 border-t border-slate-100">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Register;
