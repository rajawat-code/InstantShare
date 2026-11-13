import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Star } from 'lucide-react';
import { TapeStrip } from './HandDrawnSVGs';

/**
 * StudioHeroCollage - Asymmetric Human Studio Collage
 * Features overlapping, slightly rotated tactile photo cards with tape strips,
 * price tags, and subtle parallax float.
 */
export const StudioHeroCollage = () => {
  return (
    <div className="relative w-full h-[460px] sm:h-[500px] flex items-center justify-center select-none">
      {/* Background Decorative Stamp Accent */}
      <div className="absolute top-4 right-6 font-mono text-[11px] font-bold text-[#14281D]/30 border-2 border-dashed border-[#14281D]/25 p-3 rounded-xl rotate-6 pointer-events-none uppercase tracking-wider">
        LOCAL PEER RENTALS • NO STORES
      </div>

      {/* Card 1: Power Drill (Top-Left, tilted -2deg) */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        whileHover={{ scale: 1.04, rotate: -0.5, zIndex: 40 }}
        className="absolute top-4 left-2 sm:left-6 w-56 sm:w-64 bg-white border-2 border-[#14281D] rounded-2xl p-3 shadow-hard-lg -rotate-2 z-20 cursor-pointer transition-shadow"
      >
        <TapeStrip className="w-16 h-4 -top-2 left-6" rotate="-3deg" />
        <div className="relative h-36 rounded-xl overflow-hidden border border-[#14281D] bg-[#F6F1E9]">
          <img
            src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80"
            alt="Bosch Hammer Drill"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-[#14281D] text-[#F2B705] font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm">
            145m away
          </div>
        </div>
        <div className="pt-2.5 flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-sm text-[#14281D] leading-tight">
              Bosch Hammer Drill
            </div>
            <div className="text-[11px] text-[#4A5B52] flex items-center gap-1 mt-0.5">
              <span>Vikram's garage</span>
              <span>•</span>
              <span className="flex items-center text-[#E8590C]">
                <Star className="w-3 h-3 fill-current inline" /> 4.9
              </span>
            </div>
          </div>
          <div className="font-mono text-xs font-extrabold text-[#E8590C] bg-[#FAF7F2] px-2 py-1 border border-[#14281D] rounded-lg">
            ₹80/hr
          </div>
        </div>
      </motion.div>

      {/* Card 2: Sony Camera (Center-Right, tilted 2.5deg) */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        whileHover={{ scale: 1.05, rotate: 1, zIndex: 40 }}
        className="absolute top-24 right-2 sm:right-4 w-60 sm:w-72 bg-white border-2 border-[#14281D] rounded-2xl p-3.5 shadow-hard-xl rotate-[2.5deg] z-30 cursor-pointer transition-shadow"
      >
        <TapeStrip className="w-20 h-4 -top-2 right-8 washi-tape" rotate="4deg" />
        <div className="relative h-40 rounded-xl overflow-hidden border border-[#14281D] bg-[#F6F1E9]">
          <img
            src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"
            alt="Sony Alpha 7 III Kit"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 bg-[#E8590C] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm border border-[#14281D] shadow-hard-sm">
            Weekend Deal
          </div>
          <div className="absolute bottom-2 left-2 bg-[#14281D] text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-[#F2B705]" />
            <span>80m • Elm Street</span>
          </div>
        </div>
        <div className="pt-2.5 flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-sm text-[#14281D] leading-tight">
              Sony Alpha 7 III + 24-70mm
            </div>
            <div className="text-[11px] text-[#4A5B52] flex items-center gap-1 mt-0.5">
              <span>Aarav's studio</span>
              <span>•</span>
              <span className="text-[#14281D] font-bold">5.0 ★ (38)</span>
            </div>
          </div>
          <div className="font-mono text-sm font-extrabold text-[#14281D] bg-[#F2B705] px-2 py-1 border border-[#14281D] rounded-lg shadow-hard-sm">
            ₹120/hr
          </div>
        </div>
      </motion.div>

      {/* Card 3: Camping Tent (Bottom-Left, tilted -1deg) */}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        whileHover={{ scale: 1.04, rotate: 0, zIndex: 40 }}
        className="absolute bottom-4 left-6 sm:left-14 w-52 sm:w-60 bg-[#FAF7F2] border-2 border-[#14281D] rounded-2xl p-3 shadow-hard -rotate-1 z-10 cursor-pointer transition-shadow"
      >
        <div className="relative h-32 rounded-xl overflow-hidden border border-[#14281D] bg-white">
          <img
            src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80"
            alt="Camping Tent"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-2 left-2 bg-[#1E3A2F] text-[#F6F1E9] font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm">
            190m away
          </div>
        </div>
        <div className="pt-2 flex items-center justify-between">
          <div>
            <div className="font-display font-bold text-xs text-[#14281D]">
              Quechua 4P Tent
            </div>
            <div className="text-[10px] text-[#4A5B52]">Priya's porch</div>
          </div>
          <div className="font-mono text-xs font-bold text-[#E8590C]">
            ₹350/day
          </div>
        </div>
      </motion.div>

      {/* Hand-drawn Floating Sticker Badge */}
      <div className="absolute bottom-12 right-12 z-40 bg-[#F2B705] text-[#14281D] border-2 border-[#14281D] rounded-full px-3 py-1 font-mono text-[10px] font-black uppercase tracking-wider shadow-hard-sm rotate-6">
        Verified Neighbor Gear ★
      </div>
    </div>
  );
};

export default StudioHeroCollage;