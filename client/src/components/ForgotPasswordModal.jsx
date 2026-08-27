import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ShieldCheck, KeyRound, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';
import api from '../lib/axios';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMsg('');
    setDemoOtp('');
    onClose();
  };

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { data } = await api.post('/auth/forgot-password', { email: cleanEmail });
      setDemoOtp(data.otp || '');
      setSuccessMsg(`OTP sent to ${cleanEmail}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      await api.post('/auth/verify-otp', { email: cleanEmail, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { data } = await api.post('/auth/reset-password', { email: cleanEmail, otp, newPassword });
      setSuccessMsg(data.message || 'Password updated successfully!');
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', bounce: 0.3 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 sm:p-8"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={20} />
          </button>

          {/* Stepper Header */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s ? 'w-8 bg-blue-600' : step > s ? 'w-2 bg-emerald-500' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-600 p-3.5 rounded-xl mb-5 text-sm font-semibold border border-red-100 flex items-center gap-2"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Mail size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Forgot Password?</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Enter your registered email address and we'll send you a 6-digit OTP code.
                </p>
              </div>

              <form onSubmit={handleRequestOTP} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all mt-2"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <>
                      Send Reset Code <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Verify Verification Code</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Enter the 6-digit code sent to <span className="font-semibold text-slate-700">{email}</span>.
                </p>

                {demoOtp && (
                  <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-semibold flex items-center justify-between">
                    <span>Demo OTP Code: <strong className="text-blue-900 text-sm tracking-widest">{demoOtp}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtp(demoOtp)}
                      className="underline text-blue-700 hover:text-blue-900 text-[11px]"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">6-Digit Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    className="w-full text-center text-2xl font-black tracking-[0.5em] py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    <>
                      Verify Code <ArrowRight size={18} />
                    </>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-slate-500 hover:text-blue-600 font-semibold"
                  >
                    Change Email Address
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Reset Password */}
          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <KeyRound size={28} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Set New Password</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Create a strong password with at least 6 characters.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-slate-50 border-slate-200 focus:bg-white"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all mt-2"
                >
                  {loading ? (
                    <RefreshCw className="animate-spin" size={18} />
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 size={36} />
              </motion.div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Password Reset Complete!</h3>
              <p className="text-slate-500 text-sm mb-6">
                {successMsg || 'Your password has been successfully updated. You can now log in with your new credentials.'}
              </p>

              <Button
                onClick={handleClose}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20"
              >
                Back to Login
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;
