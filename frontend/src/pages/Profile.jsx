import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Calendar,
  RotateCcw,
  CheckCircle2,
  Users,
  Sparkles,
  Server,
  RefreshCw,
  AlertCircle,
  Edit,
  X,
  MessageSquare,
  Building,
} from 'lucide-react';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';
import ConfirmDialog from '../components/ConfirmDialog';

export const Profile = () => {
  const {
    currentUser,
    users,
    switchUser,
    resetAllData,
    showToast,
    isBackendOnline,
    isCheckingBackend,
    recheckBackend,
    apiBaseUrl,
    updateApiBaseUrl,
  } = useUser();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [customUrl, setCustomUrl] = useState(apiBaseUrl || 'http://localhost:8080/api');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [userReviews, setUserReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentUser.name || '',
    phone: currentUser.phone || '',
    businessName: currentUser.businessName || '',
    businessDescription: currentUser.businessDescription || '',
  });

  useEffect(() => {
    if (apiBaseUrl) setCustomUrl(apiBaseUrl);
  }, [apiBaseUrl]);

  useEffect(() => {
    setEditForm({
      name: currentUser.name || '',
      phone: currentUser.phone || '',
      businessName: currentUser.businessName || '',
      businessDescription: currentUser.businessDescription || '',
    });

    const loadReviews = async () => {
      try {
        setIsLoadingReviews(true);
        const reviews = await apiService.getUserReviews(currentUser.id);
        setUserReviews(Array.isArray(reviews) ? reviews : []);
      } catch (err) {
        console.warn('Could not load user reviews:', err);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    loadReviews();
  }, [currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || editForm.name.trim().length < 2) {
      showToast('Name must be between 2 and 100 characters.', 'error');
      return;
    }
    try {
      setIsSavingProfile(true);
      await apiService.updateCurrentUserProfile({
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || undefined,
        businessName: editForm.businessName.trim() || undefined,
        businessDescription: editForm.businessDescription.trim() || undefined,
      });
      showToast('Profile updated successfully (PUT /api/users/me)!', 'success');
      setIsEditModalOpen(false);
    } catch (err) {
      showToast('Failed to update profile: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header banner */}
      <div className="bg-white rounded-3xl border border-[#E1E5E1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-[#EEF3EE]"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#236B45] text-white flex items-center justify-center text-[10px] shadow-xs">
                ✓
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-[#252B27]">{currentUser.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EEF3EE] text-[#236B45] font-semibold border border-[#DCFCE7]">
                  {currentUser.role}
                </span>
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentUser.location}</span>
                <span className="text-slate-300">•</span>
                <span>Member since {currentUser.memberSince}</span>
              </p>

              <div className="flex items-center gap-4 text-xs pt-1 text-slate-600">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <strong>{currentUser.rating}</strong> ({currentUser.reviewsCount || 0} reviews)
                </span>
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ID Verified
                </span>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex sm:flex-col items-center sm:items-end justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#236B45] hover:bg-[#1b5636] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Profile (PUT /users/me)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>
        </div>

        {/* User Bio and details */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              About Member
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">{currentUser.bio}</p>
          </div>

          <div className="space-y-2 bg-[#F8F8F5] p-4 rounded-2xl border border-[#E1E5E1] text-xs">
            <h4 className="font-semibold text-slate-800">Direct Contact (Demo)</h4>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo User Switcher Card Section */}
      <div className="bg-white rounded-3xl border border-[#E1E5E1] p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#236B45]" />
            <h2 className="text-lg font-bold text-[#252B27]">Demo User Switcher</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Test InstantShare from different perspectives. Switch between 5 realistic demo users to
            simulate renters booking gear or owners managing and approving requests.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const isSelected = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'border-[#236B45] bg-[#EEF3EE]/60 shadow-xs ring-1 ring-[#236B45]/20'
                    : 'border-[#E1E5E1] bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900 text-sm truncate">{user.name}</h4>
                      {isSelected && (
                        <span className="text-[10px] font-semibold bg-[#236B45] text-white px-2 py-0.5 rounded-full flex-shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{user.location}</p>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      "{user.bio}"
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    Rating: <strong className="text-slate-800">{user.rating} ★</strong>
                  </div>

                  <button
                    type="button"
                    disabled={isSelected}
                    onClick={() => switchUser(user.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-200 text-slate-500 cursor-default'
                        : 'bg-[#236B45] text-white hover:bg-[#1b5636]'
                    }`}
                  >
                    {isSelected ? 'Current User' : 'Switch to this User'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Reviews Received (GET /api/reviews/user/{userId}) */}
      <div className="bg-white rounded-3xl border border-[#E1E5E1] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#236B45]" />
            <h2 className="text-lg font-bold text-[#252B27]">Reviews Received</h2>
          </div>
          <span className="text-xs bg-[#EEF3EE] text-[#236B45] font-semibold px-2.5 py-1 rounded-full border border-[#DCFCE7]">
            GET /api/reviews/user/{currentUser.id}
          </span>
        </div>

        {isLoadingReviews ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading verified reviews...</div>
        ) : userReviews.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-[#F8F8F5] rounded-2xl border border-dashed border-[#E1E5E1]">
            No reviews received yet. Complete rentals to earn ratings from neighbors!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {userReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#F8F8F5] p-4 rounded-2xl border border-[#E1E5E1] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{rev.reviewerName || 'Neighbor'}</span>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 italic">"{rev.comment}"</p>
                <div className="text-[10px] text-slate-400">
                  Rental #{rev.rentalId} • {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Developer & Backend Connectivity Card */}
      <div className="bg-[#F8F8F5] rounded-3xl border border-[#E1E5E1] p-6 text-xs text-slate-600 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-[#236B45]" />
            <span>Spring Boot REST Backend Integration</span>
          </h4>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isBackendOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isCheckingBackend
                ? 'Testing connection...'
                : isBackendOnline
                ? 'Spring Boot 8080 Connected'
                : 'Offline Fallback (Active)'}
            </span>
            <button
              onClick={recheckBackend}
              disabled={isCheckingBackend}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer disabled:opacity-50"
              title="Test connection to http://localhost:8080/api"
            >
              <RefreshCw className={`w-3 h-3 ${isCheckingBackend ? 'animate-spin' : ''}`} />
              <span>{isCheckingBackend ? 'Checking...' : 'Test API'}</span>
            </button>
          </div>
        </div>

        {/* Backend URL Configurator */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E1E5E1] space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="font-semibold text-slate-800 text-xs">Active Backend Service Base URL:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomUrl('http://localhost:8080/api');
                  updateApiBaseUrl('http://localhost:8080/api');
                }}
                className="text-[11px] text-[#236B45] hover:underline font-medium"
              >
                Local 8080
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={() => {
                  setCustomUrl('/api');
                  updateApiBaseUrl('/api');
                }}
                className="text-[11px] text-[#236B45] hover:underline font-medium"
              >
                Vite Proxy (/api)
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="e.g. http://localhost:8080/api or https://your-backend.railway.app/api"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-700 font-mono focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => updateApiBaseUrl(customUrl)}
              disabled={isCheckingBackend}
              className="px-3 py-1.5 rounded-xl bg-[#236B45] text-white font-medium hover:bg-[#1b5335] text-xs transition disabled:opacity-50 cursor-pointer"
            >
              Connect
            </button>
          </div>
        </div>

        <p className="leading-relaxed">
          All endpoints (Auth JWT, Categories, Equipment CRUD, Rentals lifecycle, Demo Payment Gateway checkout/confirm, and Reviews) are wired via{' '}
          <code className="text-[#236B45] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E1E5E1]">
            apiService.js
          </code>
          . When the backend server is running, the frontend automatically synchronizes with MySQL. When offline, it gracefully falls back to persistent local storage without breaking user flows.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
          <div className="bg-white p-2.5 rounded-xl border border-[#E1E5E1]">
            <span className="font-semibold text-slate-700 block">Auth & Users</span>
            <span className="text-slate-500">POST /api/auth/login, GET/PUT /api/users/me</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-[#E1E5E1]">
            <span className="font-semibold text-slate-700 block">Equipment & Rentals</span>
            <span className="text-slate-500">GET/POST /api/equipment, PATCH /api/rentals/*</span>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-[#E1E5E1]">
            <span className="font-semibold text-slate-700 block">Demo Payments</span>
            <span className="text-slate-500">POST /api/payments/checkout, demo-confirm</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal (PUT /api/users/me) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#236B45] flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Update Profile</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Connected to PUT /api/users/me</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Full Name (2–100 chars)</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
                />
              </div>

              {currentUser.role === 'BUSINESS' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Business Name</label>
                    <input
                      type="text"
                      value={editForm.businessName}
                      onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                      placeholder="e.g. Sharma Hardware & Rentals"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Business Description</label>
                    <textarea
                      value={editForm.businessDescription}
                      onChange={(e) => setEditForm({ ...editForm, businessDescription: e.target.value })}
                      rows={2}
                      placeholder="About your tool rental shop or business..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#236B45] focus:outline-hidden"
                    />
                  </div>
                </>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                Email (<code>{currentUser.email}</code>) and Role (<code>{currentUser.role}</code>) are fixed for security.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#236B45] hover:bg-[#1b5636] rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset Demo Data"
        message="This will restore all demo users, items, and rental bookings in localStorage back to the initial PRD dataset. Any newly added items or bookings created during your session will be replaced."
        confirmText="Reset to Initial Data"
        cancelText="Keep Current Data"
        confirmVariant="danger"
        onConfirm={() => {
          resetAllData();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};

export default Profile;

