import React, { useState } from 'react';
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
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import ConfirmDialog from '../components/ConfirmDialog';

export const Profile = () => {
  const { currentUser, users, switchUser, resetAllData } = useUser();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header banner */}
      <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#14281D] p-6 sm:p-8 shadow-hard">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#14281D] shadow-hard-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#14281D] text-[#F2B705] border border-[#FAF8F5] flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-serif font-black text-[#14281D]">{currentUser.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F2B705] text-[#14281D] border border-[#14281D] font-mono font-bold">
                  {currentUser.role}
                </span>
              </div>

              <p className="text-xs text-[#14281D]/70 font-sans flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E8590C]" />
                <span>{currentUser.location}</span>
                <span className="text-[#14281D]/30">•</span>
                <span className="font-mono">Neighbor since {currentUser.memberSince}</span>
              </p>

              <div className="flex items-center gap-4 text-xs pt-1 text-[#14281D]/80 font-mono">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-[#F2B705] fill-[#F2B705]" />
                  <strong>{currentUser.rating}</strong> ({currentUser.reviewsCount || 0} reviews)
                </span>
                <span className="flex items-center gap-1 text-[#14281D] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E8590C]" />
                  ID Verified
                </span>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto pt-4 sm:pt-0 border-t-2 sm:border-t-0 border-[#14281D]/10 flex sm:flex-col items-center sm:items-end justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold text-[#14281D] bg-[#F2B705]/20 hover:bg-[#F2B705]/40 border-2 border-[#14281D] shadow-hard-sm btn-tactile rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#E8590C]" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {/* User Bio and details */}
        <div className="mt-6 pt-6 border-t-2 border-[#14281D]/10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-mono font-bold text-[#14281D]/60 uppercase tracking-wider">
              About Neighbor
            </h3>
            <p className="text-sm text-[#14281D]/80 leading-relaxed font-sans">{currentUser.bio}</p>
          </div>

          <div className="space-y-2 bg-white p-4 rounded-2xl border-2 border-[#14281D] shadow-hard-sm text-xs font-mono">
            <h4 className="font-bold text-[#14281D] uppercase text-[11px]">Direct Contact</h4>
            <div className="flex items-center gap-2 text-[#14281D]/80">
              <Mail className="w-3.5 h-3.5 text-[#E8590C]" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center gap-2 text-[#14281D]/80">
              <Phone className="w-3.5 h-3.5 text-[#E8590C]" />
              <span>{currentUser.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo User Switcher Card Section */}
      <div className="bg-[#FAF8F5] rounded-3xl border-2 border-[#14281D] p-6 sm:p-8 shadow-hard space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#E8590C]" />
            <h2 className="text-2xl font-serif font-black text-[#14281D]">Neighborhood Persona Switcher</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#14281D]/70 font-sans mt-1">
            Test InstantShare from different perspectives. Switch between 5 realistic demo neighbors to
            simulate renters booking gear or owners managing and approving requests.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const isSelected = user.id === currentUser.id;
            return (
              <div
                key={user.id}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'border-[#14281D] bg-[#F2B705]/20 shadow-hard'
                    : 'border-[#14281D] bg-white shadow-hard-sm hover:shadow-hard'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-[#14281D] flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-[#14281D] text-base truncate">{user.name}</h4>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-bold bg-[#14281D] text-[#F6F1E9] px-2 py-0.5 rounded-full flex-shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#14281D]/60 truncate font-sans mt-0.5">{user.location}</p>
                    <p className="text-xs text-[#14281D]/80 line-clamp-2 mt-2 leading-relaxed italic font-serif">
                      "{user.bio}"
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#14281D]/15 flex items-center justify-between font-mono">
                  <div className="text-[11px] text-[#14281D]/70">
                    Rating: <strong className="text-[#14281D]">{user.rating} ★</strong>
                  </div>

                  <button
                    type="button"
                    disabled={isSelected}
                    onClick={() => switchUser(user.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border-2 border-[#14281D] transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-200 text-slate-500 border-slate-300 cursor-default'
                        : 'bg-[#14281D] text-[#F6F1E9] hover:bg-[#E8590C] shadow-hard-sm btn-tactile'
                    }`}
                  >
                    {isSelected ? 'Current User' : 'Switch Persona'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer & Backend Readiness Info Card */}
      <div className="bg-[#F8F8F5] rounded-3xl border border-[#E1E5E1] p-6 text-xs text-slate-600 space-y-3">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#236B45]" />
          <span>Spring Boot Backend Readiness Notes</span>
        </h4>
        <p className="leading-relaxed">
          The application is fully architected with isolated data service layers (
          <code className="text-[#236B45] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E1E5E1]">
            storageService.js
          </code>{' '}
          and{' '}
          <code className="text-[#236B45] font-mono bg-white px-1.5 py-0.5 rounded border border-[#E1E5E1]">
            apiService.js
          </code>
          ). In the subsequent development phase, the Axios endpoints can be connected directly to a
          Spring Boot REST backend with MySQL, Spring Data JPA, and Spring Security JWT tokens without
          altering UI components.
        </p>
      </div>

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

