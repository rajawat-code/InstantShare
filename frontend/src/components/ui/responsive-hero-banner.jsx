import React, { useState } from 'react';
import {
  ArrowRight,
  Play,
  Menu,
  X,
  Sparkles,
  Rocket,
  Globe,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

export const ResponsiveHeroBanner = ({
  badgeLabel = 'New',
  badgeText = 'First Commercial Flight to Mars 2026',
  title = 'Journey Beyond Earth',
  titleLine2 = 'Into the Cosmos',
  description = 'Experience the cosmos like never before. Our advanced spacecraft and cutting-edge technology make interplanetary travel accessible, safe, and unforgettable.',
  primaryButtonText = 'Book Your Journey',
  secondaryButtonText = 'Watch Launch',
  ctaButtonText = 'Reserve Seat',
  partnersTitle = 'Partnering with leading space agencies worldwide',
  backgroundImage = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=85',
  logoText = 'AETHER',
  navLinks = [
    { label: 'Destinations', href: '#destinations' },
    { label: 'Spacecraft', href: '#spacecraft' },
    { label: 'Experience', href: '#experience' },
    { label: 'Safety', href: '#safety' },
  ],
  partners = [
    { name: 'NASA', badge: 'NASA JPL' },
    { name: 'ESA', badge: 'European Space' },
    { name: 'ISRO', badge: 'Space Research' },
    { name: 'JAXA', badge: 'Aerospace Explor.' },
    { name: 'ORBITAL', badge: 'Deep Space Lab' },
  ],
  onPrimaryClick,
  onSecondaryClick,
  onCtaClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handlePrimary = () => {
    if (onPrimaryClick) onPrimaryClick();
    else setShowBookingModal(true);
  };

  const handleSecondary = () => {
    if (onSecondaryClick) onSecondaryClick();
    else setShowVideoModal(true);
  };

  const handleCta = () => {
    if (onCtaClick) onCtaClick();
    else setShowBookingModal(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#05070B] text-white overflow-hidden flex flex-col justify-between selection:bg-white/20 selection:text-white">
      {/* Background Image with Cinematic Dark Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt="Space background"
          className="w-full h-full object-cover object-center opacity-65 scale-105 transform animate-pulse duration-[10000ms]"
        />
        {/* Multilayered radial and linear vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070B]/80 via-[#05070B]/40 to-[#05070B]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#05070B_75%)]" />

        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
      </div>

      {/* Floating Glassmorphic Navigation Bar */}
      <header className="relative z-20 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <nav className="relative flex items-center justify-between px-6 py-3.5 rounded-full bg-white/[0.04] backdrop-blur-xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Rocket className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-[0.2em] uppercase text-white font-mono">
              {logoText}
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs tracking-wider uppercase text-zinc-300 font-medium">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Action */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={handleCta}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 rounded-full transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.45)] cursor-pointer"
            >
              <span>{ctaButtonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-zinc-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-5 rounded-3xl bg-[#090D14]/95 backdrop-blur-2xl border border-white/10 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleCta();
                }}
                className="w-full py-3 text-xs font-semibold uppercase tracking-wider text-black bg-white rounded-full flex items-center justify-center gap-2"
              >
                <span>{ctaButtonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Body Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-5xl mx-auto w-full space-y-8">
        {/* Animated Feature Badge */}
        {badgeText && (
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.15] shadow-lg hover:border-white/30 transition-all cursor-pointer group">
            {badgeLabel && (
              <span className="px-2 py-0.5 rounded-full bg-white text-black font-extrabold text-[10px] uppercase tracking-wider">
                {badgeLabel}
              </span>
            )}
            <span className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white transition-colors flex items-center gap-1.5">
              <span>{badgeText}</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        )}

        {/* Hero Headings with Serif & Sans Contrast */}
        <div className="space-y-2 sm:space-y-4 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white font-serif leading-[1.08]">
            {title}
          </h1>
          {titleLine2 && (
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif italic font-light tracking-tight bg-gradient-to-r from-zinc-100 via-white to-zinc-400 bg-clip-text text-transparent leading-[1.12]">
              {titleLine2}
            </h2>
          )}
        </div>

        {/* Hero Description */}
        {description && (
          <p className="max-w-2xl text-base sm:text-lg text-zinc-300/90 font-light leading-relaxed">
            {description}
          </p>
        )}

        {/* Dual Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
          {primaryButtonText && (
            <button
              type="button"
              onClick={handlePrimary}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-sm font-semibold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] hover:scale-102 transition-all duration-200 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>{primaryButtonText}</span>
            </button>
          )}

          {secondaryButtonText && (
            <button
              type="button"
              onClick={handleSecondary}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-full text-sm font-medium uppercase tracking-wider text-white bg-white/[0.08] hover:bg-white/[0.15] border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
              </div>
              <span>{secondaryButtonText}</span>
            </button>
          )}
        </div>

        {/* Quick Spec Highlights */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 border-t border-white/10 text-center text-xs tracking-wider uppercase text-zinc-400">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-normal">
              142 Days
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Earth to Mars Transit</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-white font-mono tracking-normal">
              0.38 G
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Surface Gravity</div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tracking-normal">
              100% Safe
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Autonomous Navigation</div>
          </div>
        </div>
      </main>

      {/* Partners / Space Agencies Strip */}
      <footer className="relative z-10 w-full border-t border-white/[0.08] bg-black/40 backdrop-blur-md py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xs uppercase tracking-widest text-zinc-400 font-medium text-center md:text-left">
            {partnersTitle}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-80">
            {partners.map((partner) => (
              <div
                key={partner.name}
                className="group flex items-center gap-2 cursor-pointer hover:opacity-100 transition-opacity"
              >
                <Globe className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                <div className="flex flex-col text-left">
                  <span className="font-bold text-xs tracking-widest text-zinc-300 group-hover:text-white transition-colors">
                    {partner.name}
                  </span>
                  <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-tight">
                    {partner.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>

      {/* Video Modal Preview */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-[#0B0F19] border border-white/20 rounded-3xl overflow-hidden p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                  Mission Launch Preview • Starship MK-IV
                </h3>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1517976487515-592f6984c311?auto=format&fit=crop&w=1200&q=80"
                alt="Rocket launch"
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white animate-pulse">
                  <Play className="w-7 h-7 fill-white ml-1" />
                </div>
                <div className="text-sm font-medium text-zinc-200">
                  Mission Broadcast: Countdown to Red Planet Launch Window
                </div>
                <div className="text-xs text-zinc-400">
                  Telemetry verified • Trajectory locked • Departure Summer 2026
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-5 py-2 text-xs font-semibold bg-white text-black rounded-full hover:bg-zinc-200 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Seat Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#0B0F19] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-serif font-bold text-white">
                  Reserve Orbital Cabin Seat
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Mars Mission 2026 • Tier 1 Explorer Class
                </p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Cabin Type</span>
                  <span className="text-white font-semibold">Panoramic Starlight Suite</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Transit Duration</span>
                  <span className="text-white font-semibold">142 Days</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Included Training</span>
                  <span className="text-emerald-400 font-semibold">Pre-Flight Orbital Sim</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Passenger Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Commander Sarah Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Contact Frequency (Email)
                </label>
                <input
                  type="email"
                  placeholder="sarah.chen@space-agency.org"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/40 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBookingModal(false);
                  alert('Seat reservation initiated! Pre-flight team will contact you.');
                }}
                className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-white text-black rounded-full hover:bg-zinc-200 transition-colors shadow-lg"
              >
                Confirm Priority Hold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveHeroBanner;

