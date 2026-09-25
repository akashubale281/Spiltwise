import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calculator, LogIn, Lock, Mail, AlertCircle, ArrowRight, ArrowLeft,
  Check, X, CheckCircle2, KeyRound, ShieldCheck, RefreshCw, Send, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, sendLoginOtp, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();

  // OTP Verification state
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpSentEmail, setOtpSentEmail] = useState('');
  const [otpPreview, setOtpPreview] = useState('');
  const [deliveredReal, setDeliveredReal] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [successToast, setSuccessToast] = useState('');

  const inputRefs = useRef([]);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Focus first OTP input when switching to OTP step
  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Handle Step 1: Submit email & password, request email OTP
  const handleRequestOtp = async (targetEmail = email, targetPassword = password) => {
    setErrorMsg('');
    setSuccessToast('');
    if (!targetEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await sendLoginOtp(targetEmail, targetPassword);
      setOtpSentEmail(targetEmail);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpPreview(res.otpPreview || '');
      setDeliveredReal(!!res.deliveredReal);
      setResendTimer(60);
      setStep('otp');
      setSuccessToast(`Security OTP sent to ${targetEmail} via mail.`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send verification code. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (codeToVerify = null) => {
    const code = codeToVerify || otpDigits.join('');
    setErrorMsg('');
    if (!code || code.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyLoginOtp(otpSentEmail, code);
      setSuccessToast('Email OTP verified successfully! Logging you in...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input change in 6-digit PIN boxes
  const handleDigitChange = (index, value) => {
    // Only accept numeric digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned.slice(-1); // keep last entered digit
    setOtpDigits(newDigits);

    // Auto advance focus to next input
    if (cleaned && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto verify if all 6 digits are filled
    const fullCode = newDigits.join('');
    if (fullCode.length === 6 && !newDigits.includes('')) {
      handleVerifyOtp(fullCode);
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Handle pasting full 6-digit OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pastedData.length >= 6) {
      const code = pastedData.slice(0, 6);
      const digits = code.split('');
      setOtpDigits(digits);
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
      handleVerifyOtp(code);
    }
  };

  // Quick Demo account login via OTP flow
  const handleQuickDemo = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    await handleRequestOtp(demoEmail, 'password123');
  };

  // Direct password fallback
  const handleDirectPasswordLogin = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await login(otpSentEmail || email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Direct password login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (!resetEmail || !resetNewPassword) {
      setResetError('Please enter both email and your new password.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await api.resetPassword({ email: resetEmail, newPassword: resetNewPassword });
      if (res.success) {
        setResetSuccess('Password reset successfully! You can now sign in.');
        setEmail(resetEmail);
        setPassword(resetNewPassword);
        setTimeout(() => {
          setShowForgotModal(false);
          setResetSuccess('');
        }, 2000);
      } else {
        setResetError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 animate-fade-in relative z-10">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Calculator className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            SplitVerse<span className="text-cyan-400"> AI</span>
          </h2>
          <p className="text-xs text-slate-400">
            The world's most advanced AI-powered expense splitting platform
          </p>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS ENTRY */}
        {step === 'credentials' && (
          <div className="space-y-5 animate-fade-in">
            {/* Demo Fast Login Buttons */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                ⚡ 1-Click Demo Accounts (With Email OTP Verification):
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemo('demo@splitwise.com')}
                  className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition flex items-center justify-center space-x-1"
                >
                  <span>Alex (Admin)</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickDemo('sam@splitwise.com')}
                  className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center space-x-1"
                >
                  <span>Sam Wilson</span>
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRequestOtp();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Sending Email OTP...' : 'Continue with Email OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: EMAIL OTP VERIFICATION */}
        {step === 'otp' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header info */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold border border-cyan-500/20 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Two-Factor Email Verification</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Check Your Email Inbox
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                We've sent a 6-digit security code to{' '}
                <strong className="text-slate-800 dark:text-slate-200">{otpSentEmail}</strong>
              </p>
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setErrorMsg('');
                }}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center space-x-1 mt-1 font-medium"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Change email address</span>
              </button>
            </div>

            {/* In-app Instant Email Preview Card (Active when SMTP is simulated or for local testing) */}
            {otpPreview && (
              <div className="p-3.5 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30 rounded-2xl space-y-2 animate-fade-in shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-cyan-700 dark:text-cyan-300 font-bold text-xs">
                    <Mail className="w-4 h-4 text-cyan-500" />
                    <span>Live Incoming Email Preview</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-300">
                    {deliveredReal ? 'SMTP Delivered' : 'Simulated Delivery'}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-cyan-500/20 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Security Verification Code:</div>
                    <span className="text-base font-black tracking-widest text-cyan-600 dark:text-cyan-400">
                      {otpPreview}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const digits = otpPreview.split('');
                      setOtpDigits(digits);
                      handleVerifyOtp(otpPreview);
                    }}
                    className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Autofill OTP</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 text-center">
                  💡 SplitVerse AI sends real SMTP emails when SMTP is configured in <code className="text-cyan-500">server/.env</code>.
                </p>
              </div>
            )}

            {/* 6-Digit PIN Inputs */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
                Enter 6-Digit Verification Code
              </label>
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition duration-150"
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                disabled={loading || otpDigits.join('').length !== 6}
                onClick={() => handleVerifyOtp()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-600 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Verifying Code...' : 'Verify & Sign In'}</span>
              </button>

              {/* Resend OTP */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <span className="text-slate-400">Didn't receive email?</span>
                {resendTimer > 0 ? (
                  <span className="text-slate-400 font-medium">
                    Resend in <strong className="text-cyan-500">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleRequestOtp(otpSentEmail, password)}
                    className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline inline-flex items-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>

              {/* Instant password fallback button */}
              <button
                type="button"
                onClick={handleDirectPasswordLogin}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-center transition"
              >
                Or bypass OTP with password only →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Reset Account Password
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetSuccess}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="demo@splitwise.com"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50"
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

