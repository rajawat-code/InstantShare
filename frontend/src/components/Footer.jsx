import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, Heart, CheckCircle2 } from 'lucide-react';
import { useUser } from '../context/UserContext';

export const Footer = () => {
  const { resetAllData } = useUser();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#FAF7F2] border-t-2 border-[#14281D] mt-auto relative overflow-hidden">
      {/* Top Editorial Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Column 1: Newsletter / Block Alert */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14281D] text-[#F2B705] font-mono text-[11px] font-bold uppercase tracking-wider">
              <span>● Neighborhood Radar Alerts</span>
            </div>

            <h4 className="font-display text-2xl sm:text-3xl font-bold text-[#14281D]">
              Get pinged when a neighbor lists new gear on your street.
            </h4>

            <p className="text-xs sm:text-sm text-[#4A5B52] leading-relaxed max-w-md">
              No marketing spam. Only a weekly digest of pressure washers, cameras, ladders, and camping tents added in your 500m radius.
            </p>

            {subscribed ? (
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-[#14281D] text-[#F2B705] border-2 border-[#14281D] font-mono text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                <span>You're on the neighborhood list! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your street or email..."
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white border-2 border-[#14281D] text-xs font-sans text-[#14281D] placeholder:text-[#4A5B52]/60 focus:outline-none focus:shadow-hard-sm"
                />
                <button
                  type="submit"
                  className="btn-tactile px-5 py-2.5 rounded-xl bg-[#E8590C] text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-[#14281D] shadow-hard-sm flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <span>Notify Me</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Column 2: Minimal Editorial Links */}
          <div className="lg:col-span-3 grid grid-cols-2 gap-6 text-xs">
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#14281D]">
                Marketplace
              </span>
              <ul className="space-y-2 text-[#4A5B52] font-semibold">
                <li><Link to="/explore?nearby=true" className="hover:text-[#E8590C]">200m Walking Gear</Link></li>
                <li><Link to="/explore?category=Tools and Equipment" className="hover:text-[#E8590C]">Power Tools</Link></li>
                <li><Link to="/explore?category=Electronics" className="hover:text-[#E8590C]">Cameras & Drones</Link></li>
                <li><Link to="/explore?category=Travel and Outdoor" className="hover:text-[#E8590C]">Camping & Tents</Link></li>
                <li><Link to="/explore?category=Event Equipment" className="hover:text-[#E8590C]">Projectors & Audio</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#14281D]">
                Platform
              </span>
              <ul className="space-y-2 text-[#4A5B52] font-semibold">
                <li><Link to="/add-item" className="hover:text-[#E8590C]">List Your Gear</Link></li>
                <li><Link to="/my-bookings" className="hover:text-[#E8590C]">My Bookings</Link></li>
                <li><Link to="/my-listings" className="hover:text-[#E8590C]">My Listings</Link></li>
                <li><Link to="/dashboard" className="hover:text-[#E8590C]">Owner Hub</Link></li>
                <li><Link to="/profile" className="hover:text-[#E8590C]">Neighbor ID</Link></li>
              </ul>
            </div>
          </div>

          {/* Column 3: Trust Note & Reset Demo */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 bg-white rounded-2xl border-2 border-[#14281D] shadow-hard-sm space-y-2">
              <div className="font-display font-bold text-sm text-[#14281D]">
                Neighborhood Trust Promise
              </div>
              <p className="text-xs text-[#4A5B52] leading-relaxed">
                Zero corporate cut-outs. 100% of rental payments support local creators and families living on your block.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={resetAllData}
                  className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-[#14281D] bg-[#FAF7F2] hover:bg-red-50 hover:text-red-700 border border-[#14281D] rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-500" />
                  <span>Reset Demo LocalStorage</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Giant Bold Wordmark Across the Bottom */}
        <div className="pt-14 pb-2 border-t-2 border-[#14281D]/20 mt-10">
          <div className="font-display font-black text-4xl sm:text-6xl md:text-8xl lg:text-[108px] text-[#14281D] leading-none tracking-tighter select-none opacity-90 truncate">
            INSTANTSHARE
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#4A5B52] font-mono gap-2">
            <div>
              Handcrafted for local neighborhoods. No corporate waste.
            </div>
            <div>
              InstantShare MVP © 2026 • Built with React & Tailwind
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;