import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLocation } from '../context/LocationContext';
import {
  Sparkles,
  Search,
  PlusCircle,
  CalendarCheck,
  Package,
  LayoutDashboard,
  User,
  Menu,
  X,
  ChevronDown,
  RotateCcw,
  Navigation2,
  MapPin,
} from 'lucide-react';

export const Navbar = () => {
  const {
    currentUser,
    users,
    switchUser,
    resetAllData,
    isBackendOnline,
    isCheckingBackend,
    recheckBackend,
  } = useUser();
  const { hasLocation, isDemoActive, radius, requestCurrentLocation } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore', path: '/explore' },
    { label: 'My Bookings', path: '/my-bookings' },
    { label: 'My Listings', path: '/my-listings' },
    { label: 'Owner Dashboard', path: '/dashboard' },
  ];

  const handleUserSelect = (userId) => {
    switchUser(userId);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E1E5E1] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-[#236B45] text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-[#1b5636] transition-colors">
              IS
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-[#252B27] tracking-tight">
                Instant<span className="text-[#236B45]">Share</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
                Hyperlocal Peer Rentals
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#236B45] bg-[#EEF3EE]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions & Demo Switcher */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Backend API Connectivity Indicator */}
            <button
              type="button"
              onClick={recheckBackend}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isBackendOnline
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
              title={
                isBackendOnline
                  ? 'Spring Boot Backend Connected (http://localhost:8080/api). Click to recheck.'
                  : 'Backend offline or pending. Using Local Storage Fallback. Click to test port 8080.'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden lg:inline text-[11px]">
                {isCheckingBackend ? 'Probing...' : isBackendOnline ? 'Spring Boot 8080' : 'Backend Ready'}
              </span>
            </button>

            {/* Quick Nearby Mode Pill */}
            <Link
              to={`/explore?nearby=true&radius=${radius}`}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                hasLocation
                  ? isDemoActive
                    ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                    : 'bg-[#EEF3EE] text-[#236B45] border-[#DCFCE7] hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-[#E1E5E1] hover:bg-slate-50'
              }`}
              title="Hyperlocal equipment within walking distance"
            >
              <Navigation2 className="w-3.5 h-3.5 text-[#236B45] fill-[#236B45]" />
              <span>
                {hasLocation ? (isDemoActive ? 'Demo Hub (200m)' : `GPS Nearby (${radius}m)`) : 'Near Me (200m)'}
              </span>
            </Link>

            {/* List an Item Button */}
            <Link
              to="/add-item"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#236B45] text-white hover:bg-[#1b5636] shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List an Item</span>
            </Link>

            {/* Demo User Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-[#E1E5E1] bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                aria-expanded={isUserMenuOpen}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                />
                <div className="text-left text-xs hidden lg:block">
                  <div className="font-semibold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-400">Demo User</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsUserMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Active Demo User
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Test renter and owner perspectives instantly
                      </div>
                    </div>

                    <div className="py-1">
                      {users.map((user) => {
                        const isCurrent = user.id === currentUser.id;
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleUserSelect(user.id)}
                            className={`w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-[#EEF3EE] text-[#236B45]'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold truncate flex items-center justify-between">
                                <span>{user.name}</span>
                                {isCurrent && (
                                  <span className="text-[10px] bg-[#236B45] text-white px-1.5 py-0.2 rounded-full">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {user.location}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-100 px-3 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>View Full Profile</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          resetAllData();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Demo Data</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/add-item"
              className="p-2 text-[#236B45] bg-[#EEF3EE] rounded-xl"
              aria-label="List an item"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[#E1E5E1] bg-white px-4 pt-3 pb-6 space-y-4">
          {/* Active User Pill in Mobile */}
          <div className="p-3 bg-[#F8F8F5] rounded-xl border border-[#E1E5E1] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-lg object-cover"
              />
              <div>
                <div className="text-xs font-semibold text-slate-800">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser.location}</div>
              </div>
            </div>

            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xs font-medium text-[#236B45] underline"
            >
              Profile
            </Link>
          </div>

          {/* Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#236B45] bg-[#EEF3EE]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Quick Demo Switcher on Mobile */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Switch Demo User
            </div>
            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleUserSelect(u.id)}
                  className={`p-2 rounded-xl border text-left text-xs flex items-center gap-2 cursor-pointer ${
                    u.id === currentUser.id
                      ? 'border-[#236B45] bg-[#EEF3EE] font-semibold text-[#236B45]'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover" />
                  <span className="truncate">{u.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

