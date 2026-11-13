import React from 'react';
import { motion } from 'framer-motion';

/**
 * HandDrawnSVGs - Handcrafted SVG doodles, marker strokes, and trust seals
 * Designed to give InstantShare an authentic, human-designed studio feel.
 */

// 1. Hand-Drawn Highlighter Marker Underline
export const MarkerUnderline = ({ color = '#F2B705', className = 'w-full h-3' }) => (
  <svg
    viewBox="0 0 240 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible pointer-events-none ${className}`}
    preserveAspectRatio="none"
  >
    <motion.path
      d="M3 13C45 6 120 4 237 8C195 12 90 14 28 16"
      stroke={color}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.88 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
    />
  </svg>
);

// 2. Hand-Drawn Arrow pointing to the search bar
export const HandDrawnArrow = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-2 select-none pointer-events-none ${className}`}>
    <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#E8590C] -rotate-3 bg-[#F2B705]/20 px-2 py-0.5 border border-[#E8590C]/40 rounded-sm">
      find stuff 5 min away ↗
    </span>
    <svg
      width="34"
      height="30"
      viewBox="0 0 44 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#E8590C]"
    >
      <motion.path
        d="M6 32C14 26 24 16 38 6M38 6L25 5M38 6L39 19"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />
    </svg>
  </div>
);

// 3. Rotating "Neighbor Trust" Seal Badge (Custom Detail 1)
export const NeighborTrustSeal = ({ size = 110, className = '' }) => (
  <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
    {/* Rotating Curved Text Ring */}
    <motion.svg
      viewBox="0 0 100 100"
      className="w-full h-full text-[#14281D]"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
    >
      <path
        id="sealPath"
        d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
        fill="none"
      />
      <text className="text-[8.5px] uppercase font-bold tracking-[2.5px] fill-current">
        <textPath href="#sealPath" startOffset="0%">
          ★ VERIFIED NEIGHBOR TRUST ★ 100% LOCAL ★
        </textPath>
      </text>
    </motion.svg>

    {/* Center Badge Core */}
    <div className="absolute inset-3.5 rounded-full bg-[#1E3A2F] text-[#F6F1E9] border-2 border-[#14281D] shadow-hard-sm flex flex-col items-center justify-center p-2 text-center">
      <span className="text-[10px] font-mono font-bold leading-none text-[#F2B705]">100%</span>
      <span className="text-[8px] uppercase tracking-wider font-extrabold leading-tight text-white mt-0.5">
        LOCAL
      </span>
    </div>
  </div>
);

// 4. Washi Tape Strip for Cards and Polaroids
export const TapeStrip = ({ className = 'w-20 h-5', rotate = '-2deg' }) => (
  <div
    className={`tape-strip border-t border-b border-black/10 absolute pointer-events-none z-20 ${className}`}
    style={{ transform: `rotate(${rotate})` }}
  />
);

// 5. Hand-Drawn Wiggle Underline
export const WiggleUnderline = ({ color = '#E8590C', className = 'w-full h-2.5' }) => (
  <svg
    viewBox="0 0 120 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`overflow-visible ${className}`}
    preserveAspectRatio="none"
  >
    <path
      d="M2 6 Q 15 1, 30 6 T 60 6 T 90 6 T 118 6"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);
