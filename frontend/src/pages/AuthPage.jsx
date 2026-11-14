import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Terminal,
  ServerOff,
  RefreshCw,
  Zap,
} from 'lucide-react';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';

export const AuthPage = ({ initialMode = 'login' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, currentUser, isBackendOnline, recheckBackend } = useUser();

  // Mode: 'login' (default) or 'register'
  const modeParam = searchParams.get('mode') || initialMode;
  const [mode, setMode] = useState(modeParam === 'register' ? 'register' : 'login');

  // Password visibility states (Eye Button)
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Status & loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [errorDetails, setErrorDetails] = useState(null);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Register form state
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'RENTER', // RENTER (default), OWNER, BUSINESS
    businessName: '',
    businessDescription: '',
  });

  // Sync mode with URL
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'register' || urlMode === 'login') {
      setMode(urlMode);
    }
  }, [searchParams]);

  const switchMode = (newMode) => {
    setMode(newMode);
    setError(null);
    setValidationErrors({});
    setErrorDetails(null);
    setSearchParams({ mode: newMode });
  };

  // Quick fill pre-seeded test accounts
  const handleQuickFill = (email, roleLabel) => {
    setLoginForm({
      email,
      password: 'password123',
    });
    setError(null);
    setErrorDetails(null);
  };

  // Submit Login (POST /api/auth/login)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setErrorDetails(null);

    if (!loginForm.email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!loginForm.password) {
      setError('Password is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(loginForm.email.trim(), loginForm.password, false);

      // Redirect to previous intended page or profile
      const redirectPath = location.state?.from || '/profile';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const isNet = Boolean(
        err.isNetworkError ||
          err.code === 'ERR_NETWORK' ||
          err.errorCode === 'ERR_CONNECTION_REFUSED' ||
          err.message?.includes('Network Error') ||
          err.message?.includes('Connection refused')
      );

      const detailedInfo = {
        message: err.message || 'Invalid email or password.',
        errorCode: err.errorCode || (isNet ? 'ERR_CONNECTION_REFUSED' : 'INVALID_CREDENTIALS'),
        status: err.status || (isNet ? 'net::ERR_CONNECTION_REFUSED' : 401),
        endpoint: err.endpoint || `${apiService.getBaseUrl()}/auth/login`,
        validationErrors: err.validationErrors || {},
        isNetworkError: isNet,
        timestamp: new Date().toISOString(),
      };

      setErrorDetails(detailedInfo);
      setError(err.message || 'Invalid email or password.');
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Registration (POST /api/auth/register)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    setErrorDetails(null);

    // Client-side validations adhering to backend specs
    if (!regForm.name.trim() || regForm.name.trim().length < 2 || regForm.name.trim().length > 100) {
      setError('Name must be between 2 and 100 characters.');
      return;
    }
    if (!regForm.email.trim()) {
      setError('A valid email address is required.');
      return;
    }
    if (!regForm.password || regForm.password.length < 6 || regForm.password.length > 50) {
      setError('Password must be between 6 and 50 characters.');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: regForm.name.trim(),
        email: regForm.email.trim(),
        password: regForm.password,
        phone: regForm.phone.trim() || undefined,
        role: regForm.role,
        businessName: regForm.role === 'BUSINESS' ? regForm.businessName.trim() : undefined,
        businessDescription: regForm.role === 'BUSINESS' ? regForm.businessDescription.trim() : undefined,
      };

      await register(payload, false);

      const redirectPath = location.state?.from || '/profile';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      const isNet = Boolean(
        err.isNetworkError ||
          err.code === 'ERR_NETWORK' ||
          err.errorCode === 'ERR_CONNECTION_REFUSED' ||
          err.message?.includes('Network Error') ||
          err.message?.includes('Connection refused')
      );

      const detailedInfo = {
        message: err.message || 'Registration failed.',
        errorCode: err.errorCode || (isNet ? 'ERR_CONNECTION_REFUSED' : 'BAD_REQUEST'),
        status: err.status || (isNet ? 'net::ERR_CONNECTION_REFUSED' : 400),
        endpoint: err.endpoint || `${apiService.getBaseUrl()}/auth/register`,
        validationErrors: err.validationErrors || {},
        isNetworkError: isNet,
        timestamp: new Date().toISOString(),
      };

      setErrorDetails(detailedInfo);
      setError(err.message || 'Registration failed. Email may already be in use.');
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1-Click Offline Fallback Handler
  const handleProceedOffline = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setErrorDetails(null);
      if (mode === 'login') {
        await login(loginForm.email.trim(), loginForm.password, true);
      } else {
        const payload = {
          name: regForm.name.trim(),
          email: regForm.email.trim(),
          password: regForm.password,
          phone: regForm.phone.trim() || undefined,
          role: regForm.role,
          businessName: regForm.role === 'BUSINESS' ? regForm.businessName.trim() : undefined,
          businessDescription: regForm.role === 'BUSINESS' ? regForm.businessDescription.trim() : undefined,
        };
        await register(payload, true);
      }
      const redirectPath = location.state?.from || '/profile';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setError('Offline session error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand & Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#236B45] text-white font-bold text-xl shadow-md mb-1">
            IS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#252B27] tracking-tight">
            {mode === 'login' ? 'Welcome Back to InstantShare' : 'Join InstantShare'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {mode === 'login'
              ? 'Sign in to rent tools, cameras, and gear from neighbors'
              : 'Create an account to borrow and share equipment locally'}
          </p>
        </div>

        {/* Backend Connectivity Status Pill */}
        <div className="flex items-center justify-center">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${
              isBackendOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>
              {isBackendOnline
                ? 'Spring Boot Backend Live (/api/auth)'
                : 'Offline Fallback Authentication Active'}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-[#E1E5E1] p-6 sm:p-8 shadow-sm space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-white text-[#236B45] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-white text-[#236B45] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Detailed Error & Diagnostics Card */}
          {errorDetails && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-rose-900 text-sm">
                      {errorDetails.isNetworkError
                        ? 'Backend Server Unreachable'
                        : errorDetails.status === 401
                        ? '401 Invalid Credentials'
                        : errorDetails.errorCode || 'Request Error'}
                    </span>
                    <span className="font-mono text-[10px] bg-rose-200/70 text-rose-800 px-2 py-0.5 rounded-md font-semibold">
                      {errorDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed font-medium">
                    {errorDetails.message}
                  </p>
                </div>
              </div>

              {/* Network Connection Refused Specific Guide & 1-Click Fallback */}
              {errorDetails.isNetworkError && (
                <div className="p-3 bg-white/80 rounded-xl border border-rose-200 space-y-2 text-[11px] text-slate-700">
                  <div className="flex items-center gap-1.5 font-semibold text-rose-800">
                    <ServerOff className="w-3.5 h-3.5" />
                    <span>How to fix:</span>
                  </div>
                  <p className="leading-normal text-slate-600">
                    The frontend tried to connect to <code className="text-rose-700 font-mono font-bold">{errorDetails.endpoint}</code>, but port 8080 is not listening.
                  </p>
                  <div className="bg-slate-900 text-slate-200 font-mono text-[10px] p-2 rounded-lg space-y-0.5">
                    <div># Start Spring Boot backend in terminal:</div>
                    <div className="text-emerald-400">cd backend; mvn spring-boot:run</div>
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500">Don't have backend running right now?</span>
                    <button
                      type="button"
                      onClick={handleProceedOffline}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#236B45] hover:bg-[#1b5636] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>Continue with Offline Mode</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Field-level validation errors */}
              {Object.keys(errorDetails.validationErrors || {}).length > 0 && (
                <div className="p-2.5 bg-white/70 rounded-xl border border-rose-200 space-y-1">
                  <span className="font-semibold text-rose-900 block text-[11px]">Field Validation Errors:</span>
                  <ul className="list-disc list-inside text-[11px] text-rose-700 space-y-0.5">
                    {Object.entries(errorDetails.validationErrors).map(([field, msg]) => (
                      <li key={field}>
                        <strong className="font-mono">{field}:</strong> {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technical Dev Console Snippet */}
              <div className="pt-1 text-[10px] text-rose-600/90 font-mono flex items-center justify-between border-t border-rose-200/60">
                <span>Attempted: {errorDetails.endpoint}</span>
                <span>{errorDetails.timestamp?.slice(11, 19)} UTC</span>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* LOGIN FORM (POST /api/auth/login)                             */}
          {/* ============================================================== */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. owner1@instantshare.test"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden transition-all bg-white"
                  />
                </div>
              </div>

              {/* Password with Eye Show/Hide Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden transition-all bg-white"
                  />
                  {/* Eye Button to Toggle Password Visibility */}
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4 text-[#236B45]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#236B45] hover:bg-[#1b5636] text-white font-semibold text-xs transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in via JWT API...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Account</span>
                  </>
                )}
              </button>

              {/* Pre-seeded Quick Test Accounts */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Quick Fill Test Accounts (Password: <code>password123</code>):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('owner1@instantshare.test', 'Owner')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-[#236B45] hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer font-medium"
                  >
                    Owner 1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('owner2@instantshare.test', 'Owner 2')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-50 text-[#236B45] hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer font-medium"
                  >
                    Owner 2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('renter@instantshare.test', 'Renter')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition cursor-pointer font-medium"
                  >
                    Renter
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('business@instantshare.test', 'Business')}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition cursor-pointer font-medium"
                  >
                    Business
                  </button>
                </div>
              </div>

              {/* Switch to Register link */}
              <div className="text-center pt-2 text-xs text-slate-500">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="font-bold text-[#236B45] hover:underline cursor-pointer"
                >
                  Create new account
                </button>
              </div>
            </form>
          ) : (
            /* ============================================================== */
            /* REGISTER FORM (POST /api/auth/register)                        */
            /* ============================================================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="e.g. Anshuman Sharma"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden transition-all bg-white"
                  />
                </div>
                <span className="text-[10px] text-slate-400">2–100 characters required by backend</span>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. anshu@example.com"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden transition-all bg-white"
                  />
                </div>
              </div>

              {/* Password with Eye Show/Hide Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    maxLength={50}
                    placeholder="At least 6 characters"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden transition-all bg-white"
                  />
                  {/* Eye Button */}
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showRegPassword ? 'Hide password' : 'Show password'}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-4 h-4 text-[#236B45]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">6–50 characters required</span>
              </div>

              {/* Confirm Password with Eye Show/Hide Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your password"
                    value={regForm.confirmPassword}
                    onChange={(e) =>
                      setRegForm({ ...regForm, confirmPassword: e.target.value })
                    }
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden transition-all bg-white"
                  />
                  {/* Eye Button */}
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                    aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-[#236B45]" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Phone & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="+91..."
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">Account Role</label>
                  <select
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden bg-white"
                  >
                    <option value="RENTER">RENTER (Default)</option>
                    <option value="OWNER">OWNER</option>
                    <option value="BUSINESS">BUSINESS</option>
                  </select>
                </div>
              </div>

              {/* Business specific fields */}
              {regForm.role === 'BUSINESS' && (
                <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Business Shop Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma Hardware & Tool Rentals"
                      value={regForm.businessName}
                      onChange={(e) =>
                        setRegForm({ ...regForm, businessName: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Business Description
                    </label>
                    <textarea
                      placeholder="Neighborhood hardware and tool supplier since 2015..."
                      rows={2}
                      value={regForm.businessDescription}
                      onChange={(e) =>
                        setRegForm({ ...regForm, businessDescription: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#236B45] hover:bg-[#1b5636] text-white font-semibold text-xs transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account via POST /api/auth/register...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register Account</span>
                  </>
                )}
              </button>

              {/* Switch to Login link */}
              <div className="text-center pt-2 text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="font-bold text-[#236B45] hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security & Feature Note */}
        <div className="text-center text-[11px] text-slate-400 space-y-1">
          <p className="flex items-center justify-center gap-1.5 text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#236B45]" />
            <span>24-Hour Secure JWT Bearer Token Authentication</span>
          </p>
          <p>
            Connected to <code>POST /api/auth/login</code> and <code>POST /api/auth/register</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
