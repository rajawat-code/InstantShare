import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLocation } from '../context/LocationContext';
import {
  Sparkles,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  RotateCcw,
  Navigation2,
  MapPin,
  User,
  Heart,
} from 'lucide-react';

export const Navbar = () => {
  const { currentUser, users, switchUser, resetAllData } = useUser();
  const { hasLocation, isDemoActive, radius } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Explore Gear', path: '/explore' },
    { label: 'My Bookings', path: '/my-bookings' },
    { label: 'My Listings', path: '/my-listings' },
    { label: 'Owner Hub', path: '/dashboard' },
  ];

  const handleUserSelect = (userId) => {
    switchUser(userId);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F6F1E9]/95 backdrop-blur-md border-b-2 border-[#14281D] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Neighborhood Tag */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#14281D] text-[#F2B705] border-2 border-[#14281D] shadow-hard-sm flex items-center justify-center font-display font-black text-xl group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] transition-transform">
              IS
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl text-[#14281D] tracking-tight leading-none">
                Instant<span className="text-[#E8590C]">Share</span>
              </span>
              <span className="font-mono text-[10px] text-[#4A5B52] font-bold uppercase tracking-wider mt-1">
                Neighbor-to-Neighbor Rentals
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-xl font-sans text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-[#14281D] border-2 border-[#14281D] shadow-hard-sm'
                    : 'text-[#14281D]/80 hover:text-[#14281D] hover:bg-[#FAF7F2] border border-transparent'
                }`
              }
            >
              Home
            </NavLink>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl font-sans text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-[#14281D] border-2 border-[#14281D] shadow-hard-sm'
                      : 'text-[#14281D]/80 hover:text-[#14281D] hover:bg-[#FAF7F2] border border-transparent'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions: Quick 200m Chip, List Gear CTA, Demo Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* 200m Proximity Pill */}
            <Link
              to={`/explore?nearby=true&radius=${radius}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-white text-[#14281D] border-2 border-[#14281D] shadow-hard-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              title="Filter items within walking distance"
            >
              <Navigation2 className="w-3.5 h-3.5 text-[#E8590C] fill-[#E8590C]" />
              <span>
                {hasLocation ? (isDemoActive ? 'Green Park (200m)' : `GPS Nearby (${radius}m)`) : '200m Walking'}
              </span>
            </Link>

            {/* List Your Gear CTA */}
            <Link
              to="/add-item"
              className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-[#E8590C] text-white border-2 border-[#14281D] shadow-hard-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Gear</span>
            </Link>

            {/* Active Neighbor Profile / Persona Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="btn-tactile flex items-center gap-2 p-1.5 pr-3 rounded-xl border-2 border-[#14281D] bg-white shadow-hard-sm cursor-pointer"
                aria-expanded={isUserMenuOpen}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-[#14281D]"
                />
                <div className="text-left text-xs hidden lg:block leading-tight">
                  <div className="font-bold text-[#14281D]">
                    {currentUser.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-[#4A5B52] font-mono">Neighbor</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#14281D]" />
              </button>

              {/* Persona Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-[#FAF7F2] rounded-2xl shadow-hard-xl border-2 border-[#14281D] py-3 z-30 animate-in fade-in duration-150">
                    <div className="px-4 pb-2 border-b-2 border-[#14281D]/20">
                      <div className="text-xs font-mono font-bold text-[#E8590C] uppercase tracking-wider">
                        Switch Active Neighbor
                      </div>
                      <div className="text-[11px] text-[#4A5B52] mt-0.5">
                        Test renter and owner flows instantly
                      </div>
                    </div>

                    <div className="py-2 max-h-60 overflow-y-auto">
                      {users.map((user) => {
                        const isCurrent = user.id === currentUser.id;
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => handleUserSelect(user.id)}
                            className={`w-full px-4 py-2 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-[#14281D] text-white font-bold'
                                : 'hover:bg-white text-[#14281D]'
                            }`}
                          >
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-7 h-7 rounded-lg object-cover border border-[#14281D]"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold truncate flex items-center justify-between">
                                <span>{user.name}</span>
                                {isCurrent && (
                                  <span className="text-[9px] bg-[#F2B705] text-[#14281D] px-1.5 py-0.2 rounded font-mono font-bold">
                                    ACTIVE
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#4A5B52] truncate">
                                {user.location}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t-2 border-[#14281D]/20 px-3 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#14281D] hover:bg-white rounded-lg border border-transparent hover:border-[#14281D] transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#E8590C]" />
                        <span>View Neighbor Profile</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          resetAllData();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#14281D] hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors cursor-pointer text-left"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                        <span>Reset All Demo Data</span>
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
              className="p-2 text-white bg-[#E8590C] rounded-xl border-2 border-[#14281D] shadow-hard-sm"
              aria-label="List gear"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white border-2 border-[#14281D] text-[#14281D] shadow-hard-sm"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t-2 border-[#14281D] bg-[#FAF7F2] px-4 pt-4 pb-6 space-y-4">
          <div className="p-3 bg-white rounded-2xl border-2 border-[#14281D] shadow-hard-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-xl object-cover border border-[#14281D]"
              />
              <div>
                <div className="text-xs font-bold text-[#14281D]">{currentUser.name}</div>
                <div className="text-[10px] text-[#4A5B52] font-mono">{currentUser.location}</div>
              </div>
            </div>
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-xs font-mono font-bold text-[#E8590C] underline"
            >
              Profile
            </Link>
          </div>

          <div className="space-y-1.5">
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 rounded-xl font-bold text-sm border-2 ${
                  isActive
                    ? 'bg-[#14281D] text-white border-[#14281D] shadow-hard-sm'
                    : 'bg-white text-[#14281D] border-[#14281D]'
                }`
              }
            >
              Home
            </NavLink>
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2.5 rounded-xl font-bold text-sm border-2 ${
                    isActive
                      ? 'bg-[#14281D] text-white border-[#14281D] shadow-hard-sm'
                      : 'bg-white text-[#14281D] border-[#14281D]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div>
            <div className="text-xs font-mono font-bold text-[#14281D] uppercase tracking-wider mb-2">
              Switch Active Neighbor
            </div>
            <div className="grid grid-cols-2 gap-2">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleUserSelect(u.id)}
                  className={`p-2 rounded-xl border-2 text-left text-xs flex items-center gap-2 cursor-pointer ${
                    u.id === currentUser.id
                      ? 'border-[#14281D] bg-[#F2B705] font-bold text-[#14281D] shadow-hard-sm'
                      : 'border-[#14281D] bg-white text-[#14281D]'
                  }`}
                >
                  <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-md object-cover border border-[#14281D]" />
                  <span className="truncate font-semibold">{u.name.split(' ')[0]}</span>
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