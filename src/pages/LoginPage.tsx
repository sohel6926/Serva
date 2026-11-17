import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, KeyRound, Lock, Mail, Phone, ShieldCheck, UserCheck, Zap } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Link, useRouter } from '../lib/router.tsx';

type TabMode = 'login' | 'register' | 'forgot';
type LoginMethod = 'password' | 'otp';

export function LoginPage() {
  const { refreshUser, user, loginAsDemo } = useAuth();
  const { navigate, search } = useRouter();
  const nextPath = new URLSearchParams(search).get('next') || '/';

  const [tab, setTab] = useState<TabMode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');

  // Login fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP fields
  const [otpMobile, setOtpMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Register fields
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'CUSTOMER' | 'PARTNER'>('CUSTOMER');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState('');

  // Forgot password fields
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotOtpSent, setForgotOtpSent] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const clearAlerts = () => {
    setError(null);
    setInfo(null);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!identifier.trim() || !password) {
      setError('Please enter your email or mobile number and password.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Fallback for demo logins on static hosting (e.g. Vercel)
        const lower = identifier.trim().toLowerCase();
        if (lower === 'ananya@serva.demo' || lower === '9876543210') {
          await loginAsDemo('customer');
          navigate(nextPath);
          return;
        } else if (lower === 'ramesh.partner@serva.demo' || lower === '9876543211') {
          await loginAsDemo('partner');
          navigate('/partner/dashboard');
          return;
        } else if (lower === 'admin@serva.demo' || lower === '9876543212') {
          await loginAsDemo('admin');
          navigate('/admin');
          return;
        }
        setError(data.error || 'Sign in failed.');
        return;
      }
      const loggedUser = await refreshUser();
      if (loggedUser?.role === 'ADMIN') navigate('/admin');
      else if (loggedUser?.role === 'PARTNER') navigate('/partner/dashboard');
      else navigate(nextPath);
    } catch {
      setError('Network error while signing in. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleSendOtp = async (mobile: string, purpose: 'LOGIN' | 'REGISTER' | 'RESET') => {
    clearAlerts();
    if (!/^[6-9]\d{9}$/.test(mobile.trim())) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile: mobile.trim(), purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send OTP.');
        return;
      }
      if (purpose === 'LOGIN') setOtpSent(true);
      if (purpose === 'REGISTER') setRegOtpSent(true);
      if (purpose === 'RESET') setForgotOtpSent(true);
      setDevOtpHint(data.devPreviewOtp ?? null);
      setInfo(data.message || 'OTP sent successfully.');
    } catch {
      setError('Network error sending OTP.');
    } finally {
      setBusy(false);
    }
  };

  const handleOtpLoginVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError('Enter the 6-digit OTP code.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile: otpMobile.trim(), code: otpCode.trim(), mode: 'LOGIN' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'OTP verification failed.');
        return;
      }
      const loggedUser = await refreshUser();
      if (loggedUser?.role === 'ADMIN') navigate('/admin');
      else if (loggedUser?.role === 'PARTNER') navigate('/partner/dashboard');
      else navigate(nextPath);
    } catch {
      setError('Network error verifying OTP.');
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (regName.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(regMobile.trim())) {
      setError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: regName.trim(),
          mobile: regMobile.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
          otpCode: regOtpCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed.');
        return;
      }
      await refreshUser();
      navigate(regRole === 'PARTNER' ? '/partner/register' : nextPath);
    } catch {
      setError('Network error while creating account.');
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    if (!/^\d{6}$/.test(forgotOtp.trim()) || forgotNewPassword.length < 6) {
      setError('Enter the 6-digit OTP and a new password (min 6 characters).');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: forgotMobile.trim(),
          code: forgotOtp.trim(),
          newPassword: forgotNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Password reset failed.');
        return;
      }
      setInfo(data.message || 'Password updated. Please sign in.');
      setTab('login');
      setLoginMethod('password');
      setIdentifier(forgotMobile.trim());
    } catch {
      setError('Network error resetting password.');
    } finally {
      setBusy(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    clearAlerts();
    setBusy(true);
    try {
      const res = await fetch(`/api/auth/oauth/${provider}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        setError('Social sign-in failed.');
        return;
      }
      await refreshUser();
      navigate(nextPath);
    } catch {
      setError('Network error during social sign-in.');
    } finally {
      setBusy(false);
    }
  };

  const quickDemoLogin = async (role: 'customer' | 'partner' | 'admin') => {
    clearAlerts();
    setBusy(true);
    try {
      const loggedUser = await loginAsDemo(role);
      if (loggedUser?.role === 'ADMIN') navigate('/admin');
      else if (loggedUser?.role === 'PARTNER') navigate('/partner/dashboard');
      else navigate(nextPath);
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Brand Card */}
      <div className="lg:col-span-5 serva-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-3">
          <BrandLogo variant="stacked" />
          <h1 className="text-2xl font-bold text-[#0A1F5C]">All Your Needs, One Platform</h1>
          <p className="text-sm text-[#5B6B8C]">
            Sign in or create your SERVA account to book trusted services, track live orders, and
            manage your wallet.
          </p>
        </div>

        {user && (
          <div className="p-4 rounded-2xl bg-[#EAF2FF] border border-[#C7DCFF] text-sm text-[#0A1F5C]">
            Currently signed in as <strong>{user.name}</strong> ({user.role}).{' '}
            <Link to="/" className="text-[#0B5FD9] font-semibold underline">
              Go Home
            </Link>
          </div>
        )}

        {/* Sample Demo Accounts for Testing */}
        <div className="pt-4 border-t border-[#EAF2FF] space-y-2.5">
          <p className="text-xs font-semibold text-[#5B6B8C]">
            Sample Demo Logins (for testing)
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => quickDemoLogin('customer')}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE7F9] hover:bg-[#F1F6FF] text-left text-xs flex items-center justify-between cursor-pointer"
            >
              <span>
                <strong className="text-[#0A1F5C] block">Customer · Ananya Reddy</strong>
                <span className="text-[#5B6B8C]">ananya@serva.demo · 9876543210</span>
              </span>
              <UserCheck className="w-4 h-4 text-[#0B5FD9]" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => quickDemoLogin('partner')}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE7F9] hover:bg-[#F1F6FF] text-left text-xs flex items-center justify-between cursor-pointer"
            >
              <span>
                <strong className="text-[#0A1F5C] block">Partner (Verified) · Ramesh Kumar</strong>
                <span className="text-[#5B6B8C]">ramesh.partner@serva.demo</span>
              </span>
              <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => quickDemoLogin('admin')}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DCE7F9] hover:bg-[#F1F6FF] text-left text-xs flex items-center justify-between cursor-pointer"
            >
              <span>
                <strong className="text-[#0A1F5C] block">Admin · SERVA Operations</strong>
                <span className="text-[#5B6B8C]">admin@serva.demo</span>
              </span>
              <KeyRound className="w-4 h-4 text-[#0B5FD9]" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Auth Form Card */}
      <div className="lg:col-span-7 serva-card p-6 sm:p-8">
        {/* Top Tabs */}
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="grid grid-cols-2 p-1 rounded-2xl bg-[#EAF2FF] mb-6"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'login'}
            onClick={() => {
              setTab('login');
              clearAlerts();
            }}
            className={`min-h-[44px] rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              tab === 'login' ? 'bg-white text-[#0A1F5C] shadow-sm' : 'text-[#5B6B8C]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'register'}
            onClick={() => {
              setTab('register');
              clearAlerts();
            }}
            className={`min-h-[44px] rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
              tab === 'register' ? 'bg-white text-[#0A1F5C] shadow-sm' : 'text-[#5B6B8C]'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-[#DC2626] font-medium"
          >
            {error}
          </div>
        )}
        {info && (
          <div
            role="status"
            className="mb-4 p-3.5 rounded-xl bg-green-50 border border-green-200 text-sm text-[#16A34A] font-medium"
          >
            {info}
            {devOtpHint && (
              <span className="block mt-1 text-xs text-[#0A1F5C]">
                Sample dev OTP code: <strong className="font-mono-num">{devOtpHint}</strong>
              </span>
            )}
          </div>
        )}

        {tab === 'login' && (
          <div className="space-y-5">
            {/* Password vs OTP Toggle */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('password');
                  clearAlerts();
                }}
                className={`min-h-[40px] px-4 rounded-full text-xs font-semibold border cursor-pointer ${
                  loginMethod === 'password'
                    ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]'
                    : 'bg-white text-[#0A1F5C] border-[#DCE7F9]'
                }`}
              >
                Email / Mobile & Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('otp');
                  clearAlerts();
                }}
                className={`min-h-[40px] px-4 rounded-full text-xs font-semibold border cursor-pointer ${
                  loginMethod === 'otp'
                    ? 'bg-[#0B5FD9] text-white border-[#0B5FD9]'
                    : 'bg-white text-[#0A1F5C] border-[#DCE7F9]'
                }`}
              >
                Mobile OTP
              </button>
            </div>

            {loginMethod === 'password' ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-identifier" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                    Mobile Number or Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-identifier"
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. 9876543210 or ananya@serva.demo"
                      className="w-full min-h-[46px] pl-10 pr-4 rounded-xl border border-[#DCE7F9] text-sm focus:border-[#0B5FD9] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="login-password" className="text-sm font-semibold text-[#0A1F5C]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('forgot');
                        clearAlerts();
                      }}
                      className="text-xs font-semibold text-[#0B5FD9] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full min-h-[46px] pl-10 pr-12 rounded-xl border border-[#DCE7F9] text-sm focus:border-[#0B5FD9] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#5B6B8C] hover:text-[#0A1F5C] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={busy} className="w-full serva-pill-btn">
                  <span>{busy ? 'Signing in...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Instant 1-Click Demo Login */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => quickDemoLogin('customer')}
                    className="w-full min-h-[46px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>⚡ One-Click Demo Login (Customer)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => quickDemoLogin('partner')}
                      className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-[#DCE7F9] bg-[#F8FAFC] hover:bg-[#F1F6FF] text-[#0A1F5C] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Demo Partner</span>
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => quickDemoLogin('admin')}
                      className="min-h-[38px] px-2.5 py-1.5 rounded-lg border border-[#DCE7F9] bg-[#F8FAFC] hover:bg-[#F1F6FF] text-[#0A1F5C] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-98 transition-all cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#0B5FD9]" />
                      <span>Demo Admin</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpLoginVerify} className="space-y-4">
                <div>
                  <label htmlFor="otp-mobile" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                    10-Digit Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-[#5B6B8C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="otp-mobile"
                        type="tel"
                        maxLength={10}
                        value={otpMobile}
                        onChange={(e) => setOtpMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className="w-full min-h-[46px] pl-10 pr-4 rounded-xl border border-[#DCE7F9] text-sm font-mono-num focus:border-[#0B5FD9] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleSendOtp(otpMobile, 'LOGIN')}
                      className="min-h-[46px] px-4 rounded-xl bg-[#EAF2FF] text-[#0B5FD9] font-semibold text-sm hover:bg-[#DCE7F9] whitespace-nowrap cursor-pointer"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label htmlFor="otp-code" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                      6-Digit OTP Code
                    </label>
                    <input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full min-h-[46px] px-4 rounded-xl border border-[#DCE7F9] text-sm font-mono-num tracking-widest focus:border-[#0B5FD9] focus:outline-none"
                    />
                  </div>
                )}

                <button type="submit" disabled={busy || !otpSent} className="w-full serva-pill-btn">
                  <span>{busy ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Social Login Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EAF2FF]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#5B6B8C]">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => handleOAuth('google')}
                className="min-h-[46px] px-4 rounded-full border border-[#DCE7F9] hover:bg-[#F5F9FF] text-sm font-semibold text-[#0A1F5C] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="font-bold text-[#0B5FD9]">G</span>
                <span>Continue with Google</span>
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => handleOAuth('apple')}
                className="min-h-[46px] px-4 rounded-full border border-[#DCE7F9] hover:bg-[#F5F9FF] text-sm font-semibold text-[#0A1F5C] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="font-bold text-[#111111]"></span>
                <span>Continue with Apple</span>
              </button>
            </div>
          </div>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                Full Name
              </label>
              <input
                id="reg-name"
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full min-h-[46px] px-4 rounded-xl border border-[#DCE7F9] text-sm focus:border-[#0B5FD9] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-mobile" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                Mobile Number (OTP Verification)
              </label>
              <div className="flex gap-2">
                <input
                  id="reg-mobile"
                  type="tel"
                  maxLength={10}
                  value={regMobile}
                  onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="flex-1 min-h-[46px] px-4 rounded-xl border border-[#DCE7F9] text-sm font-mono-num focus:border-[#0B5FD9] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSendOtp(regMobile, 'REGISTER')}
                  className="min-h-[46px] px-4 rounded-xl bg-[#EAF2FF] text-[#0B5FD9] font-semibold text-sm hover:bg-[#DCE7F9] whitespace-nowrap cursor-pointer"
                >
                  {regOtpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
            </div>

            {regOtpSent && (
              <div>
                <label htmlFor="reg-otp" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                  Enter OTP Code
                </label>
                <input
                  id="reg-otp"
                  type="text"
                  maxLength={6}
                  value={regOtpCode}
                  onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="6-digit OTP"
                  className="w-full min-h-[46px] px-4 rounded-xl border border-[#DCE7F9] text-sm font-mono-num focus:border-[#0B5FD9] focus:outline-none"
                />
              </div>
            )}

            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                Email Address (optional)
              </label>
              <input
                id="reg-email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full min-h-[46px] px-4 rounded-xl border border-[#DCE7F9] text-sm focus:border-[#0B5FD9] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                Create Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full min-h-[46px] px-4 pr-12 rounded-xl border border-[#DCE7F9] text-sm focus:border-[#0B5FD9] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#5B6B8C] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <span className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">Account Type</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegRole('CUSTOMER')}
                  className={`min-h-[44px] px-4 rounded-xl border text-sm font-semibold cursor-pointer ${
                    regRole === 'CUSTOMER'
                      ? 'bg-[#EAF2FF] border-[#0B5FD9] text-[#0B5FD9]'
                      : 'border-[#DCE7F9] text-[#0A1F5C]'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('PARTNER')}
                  className={`min-h-[44px] px-4 rounded-xl border text-sm font-semibold cursor-pointer ${
                    regRole === 'PARTNER'
                      ? 'bg-[#EAF2FF] border-[#0B5FD9] text-[#0B5FD9]'
                      : 'border-[#DCE7F9] text-[#0A1F5C]'
                  }`}
                >
                  Service Partner
                </button>
              </div>
            </div>

            <button type="submit" disabled={busy} className="w-full serva-pill-btn">
              <span>{busy ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {tab === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0A1F5C]">Reset Password</h2>
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  clearAlerts();
                }}
                className="text-xs font-semibold text-[#0B5FD9] hover:underline cursor-pointer"
              >
                Back to Login
              </button>
            </div>
            <div>
              <label htmlFor="forgot-mobile" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                Registered Mobile Number
              </label>
              <div className="flex gap-2">
                <input
                  id="forgot-mobile"
                  type="tel"
                  maxLength={10}
                  value={forgotMobile}
                  onChange={(e) => setForgotMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="10-digit mobile number"
                  className="flex-1 min-h-[46px] px-4 rounded-xl border border-[#DCE7F9] text-sm font-mono-num focus:border-[#0B5FD9] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => handleSendOtp(forgotMobile, 'RESET')}
                  className="min-h-[46px] px-4 rounded-xl bg-[#EAF2FF] text-[#0B5FD9] font-semibold text-sm cursor-pointer"
                >
                  {forgotOtpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
            </div>
            {forgotOtpSent && (
              <>
                <div>
                  <label htmlFor="forgot-otp" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                    6-Digit OTP
                  </label>
                  <input
                    id="forgot-otp"
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full min-h-[46px] px-4 rounded-xl border border-[#DCE7F9] text-sm font-mono-num focus:border-[#0B5FD9] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="forgot-pw" className="block text-sm font-semibold text-[#0A1F5C] mb-1.5">
                    New Password
                  </label>
                  <input
                    id="forgot-pw"
                    type="password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full min-h-[46px] px-4 rounded-xl border border-[#DCE7F9] text-sm focus:border-[#0B5FD9] focus:outline-none"
                  />
                </div>
                <button type="submit" disabled={busy} className="w-full serva-pill-btn">
                  <span>Update Password</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
