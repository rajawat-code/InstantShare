import React, { useState } from 'react';
import { LogIn, UserPlus, X, Mail, Lock, User, Phone, Briefcase, AlertCircle, Loader2, Eye, EyeOff, ServerOff, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';
import apiService from '../services/apiService';

export const AuthModal = ({ isOpen, initialTab = 'login', onClose }) => {
  const { login, register, showToast } = useUser();
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

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
    phone: '',
    role: 'RENTER', // RENTER, OWNER, BUSINESS
    businessName: '',
    businessDescription: '',
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      setErrorDetails(null);
      await login(loginForm.email.trim(), loginForm.password, false);
      onClose();
    } catch (err) {
      const isNet = Boolean(
        err.isNetworkError ||
          err.code === 'ERR_NETWORK' ||
          err.errorCode === 'ERR_CONNECTION_REFUSED' ||
          err.message?.includes('Network Error') ||
          err.message?.includes('Connection refused')
      );
      setErrorDetails({
        message: err.message || 'Invalid email or password.',
        status: err.status || (isNet ? 'net::ERR_CONNECTION_REFUSED' : 401),
        endpoint: `${apiService.getBaseUrl()}/auth/login`,
        isNetworkError: isNet,
      });
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regForm.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      setErrorDetails(null);
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
      onClose();
    } catch (err) {
      const isNet = Boolean(
        err.isNetworkError ||
          err.code === 'ERR_NETWORK' ||
          err.errorCode === 'ERR_CONNECTION_REFUSED' ||
          err.message?.includes('Network Error') ||
          err.message?.includes('Connection refused')
      );
      setErrorDetails({
        message: err.message || 'Registration failed.',
        status: err.status || (isNet ? 'net::ERR_CONNECTION_REFUSED' : 400),
        endpoint: `${apiService.getBaseUrl()}/auth/register`,
        isNetworkError: isNet,
      });
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProceedOffline = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      setErrorDetails(null);
      if (tab === 'login') {
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
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {tab === 'login' ? 'Sign In to InstantShare' : 'Create an Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {tab === 'login'
                ? 'Authenticates directly via POST /api/auth/login'
                : 'Registers new member via POST /api/auth/register'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              tab === 'login' ? 'bg-white text-[#236B45] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-2 rounded-xl transition cursor-pointer ${
              tab === 'register' ? 'bg-white text-[#236B45] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {errorDetails && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-rose-900">
                    {errorDetails.isNetworkError ? 'Backend Server Offline' : 'Request Error'}
                  </span>
                  <span className="font-mono text-[10px] bg-rose-200/60 text-rose-800 px-1.5 py-0.2 rounded font-semibold">
                    {errorDetails.status}
                  </span>
                </div>
                <p className="text-[11px] text-rose-700 leading-normal">{errorDetails.message}</p>
              </div>
            </div>

            {errorDetails.isNetworkError && (
              <div className="pt-1 flex items-center justify-between gap-2 border-t border-rose-200/60">
                <span className="text-[10px] text-slate-500">Target: {errorDetails.endpoint}</span>
                <button
                  type="button"
                  onClick={handleProceedOffline}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#236B45] text-white text-[11px] font-semibold transition cursor-pointer"
                >
                  <Zap className="w-3 h-3 text-amber-300" />
                  <span>Use Offline Mode</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="e.g. owner1@instantshare.test"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-3.5 h-3.5 text-[#236B45]" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-[#F8F8F5] p-3 rounded-xl border border-[#E1E5E1]">
              <strong>Demo accounts:</strong> <code>owner1@instantshare.test</code> or <code>renter@instantshare.test</code> (password: <code>password123</code>).
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-[#236B45] hover:bg-[#1b5636] text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Full Name (2–100 chars)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="Anshu Sharma"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">Password (6–50 chars)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-2.5 top-2 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? (
                    <EyeOff className="w-3.5 h-3.5 text-[#236B45]" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Phone (Optional)</label>
                <input
                  type="text"
                  placeholder="+91..."
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Role</label>
                <select
                  value={regForm.role}
                  onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden bg-white"
                >
                  <option value="RENTER">RENTER</option>
                  <option value="OWNER">OWNER</option>
                  <option value="BUSINESS">BUSINESS</option>
                </select>
              </div>
            </div>

            {regForm.role === 'BUSINESS' && (
              <div className="space-y-2 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Business Shop Name</label>
                  <input
                    type="text"
                    placeholder="e.g. City Tool Rentals"
                    value={regForm.businessName}
                    onChange={(e) => setRegForm({ ...regForm, businessName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">Description</label>
                  <input
                    type="text"
                    placeholder="About your hardware supply store..."
                    value={regForm.businessDescription}
                    onChange={(e) => setRegForm({ ...regForm, businessDescription: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-[#236B45] hover:bg-[#1b5636] text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
