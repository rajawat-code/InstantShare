import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * NeighborhoodMapSection - Handcrafted Local Proximity Map (Custom Detail 2)
 * Shows real local street blocks with pulsing pins indicating nearby items.
 */
export const NeighborhoodMapSection = () => {
  const [selectedPin, setSelectedPin] = useState(1);

  const pins = [
    {
      id: 1,
      name: 'Bosch Hammer Drill',
      owner: 'Vikram S.',
      street: 'Green Park Main, Block B',
      distance: '145m away (2 min walk)',
      price: '₹80/hr',
      category: 'Tools',
      x: '38%',
      y: '42%',
      color: '#E8590C',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 2,
      name: 'Sony Alpha 7 III Camera',
      owner: 'Aarav S.',
      street: 'Elm Street, 2nd Floor',
      distance: '80m away (1 min walk)',
      price: '₹120/hr',
      category: 'Electronics',
      x: '58%',
      y: '32%',
      color: '#1E3A2F',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 3,
      name: '4-Person Camping Tent',
      owner: 'Priya P.',
      street: 'Market Lane, Corner House',
      distance: '190m away (3 min walk)',
      price: '₹350/day',
      category: 'Outdoor',
      x: '28%',
      y: '68%',
      color: '#F2B705',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 4,
      name: 'JBL PartyBox Speaker',
      owner: 'Rohan V.',
      street: 'Park Extension, Block A',
      distance: '110m away (2 min walk)',
      price: '₹150/hr',
      category: 'Events',
      x: '72%',
      y: '62%',
      color: '#1E3A2F',
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=300&q=80',
    },
  ];

  const activePin = pins.find((p) => p.id === selectedPin) || pins[0];

  return (
    <div className="bg-[#FAF7F2] border-2 border-[#14281D] rounded-3xl p-6 sm:p-8 shadow-hard-lg relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1E3A2F] text-[#F6F1E9] text-xs font-mono font-bold tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-[#F2B705] animate-ping" />
            <span>HYPERLOCAL 200M RADIUS</span>
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14281D]">
            Look what's sitting on your block right now
          </h3>
          <p className="text-sm text-[#4A5B52] mt-1">
            Tap a pin on the street map to see who's lending what across the lane.
          </p>
        </div>

        <Link
          to="/explore?nearby=true"
          className="btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#14281D] text-[#F6F1E9] text-xs font-bold font-mono uppercase tracking-wider border-2 border-[#14281D] shadow-hard-sm"
        >
          <span>Open Full Map View</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#F2B705]" />
        </Link>
      </div>

      {/* Grid: Map on Left, Active Item Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* The Illustrated Map Canvas */}
        <div className="lg:col-span-8 relative h-[320px] sm:h-[380px] bg-[#EDE6DC] rounded-2xl border-2 border-[#14281D] overflow-hidden p-4 select-none">
          {/* Street Grid Illustration */}
          <div className="absolute inset-0 opacity-40">
            {/* Horizontal & Diagonal Street lines */}
            <div className="absolute top-1/3 left-0 right-0 h-10 bg-[#FAF7F2] border-y-2 border-dashed border-[#14281D]/30 flex items-center justify-center">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#14281D]/50 font-bold">
                GREEN PARK MAIN ROAD
              </span>
            </div>
            <div className="absolute bottom-1/4 left-0 right-0 h-8 bg-[#FAF7F2] border-y-2 border-dashed border-[#14281D]/30 flex items-center justify-center">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#14281D]/50 font-bold">
                MARKET LANE
              </span>
            </div>
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-9 bg-[#FAF7F2] border-x-2 border-dashed border-[#14281D]/30 flex items-center justify-center">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#14281D]/50 font-bold rotate-90">
                BLOCK B CROSSING
              </span>
            </div>
            {/* Green park zone */}
            <div className="absolute top-6 left-6 w-32 h-20 bg-[#DCE5DD] rounded-xl border border-[#14281D]/20 flex items-center justify-center p-2 text-center">
              <span className="font-mono text-[9px] font-bold text-[#1E3A2F]">Community Park</span>
            </div>
          </div>

          {/* 200m Proximity Radar Circle Overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-[#1E3A2F]/30 bg-[#1E3A2F]/5 pointer-events-none flex items-center justify-center">
            <div className="w-36 h-36 rounded-full border border-dashed border-[#1E3A2F]/40" />
            <div className="absolute bottom-2 font-mono text-[9px] font-bold text-[#1E3A2F] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#1E3A2F]/30">
              200m Walking Boundary
            </div>
          </div>

          {/* User Location Center Pin */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
            <div className="w-5 h-5 rounded-full bg-[#E8590C] border-2 border-[#14281D] shadow-hard-sm flex items-center justify-center text-white text-[10px] font-bold animate-pulse">
              ●
            </div>
            <span className="font-mono text-[9px] font-bold bg-[#14281D] text-white px-2 py-0.5 rounded-sm mt-1 shadow-sm">
              YOU ARE HERE
            </span>
          </div>

          {/* Interactive Pulsing Street Pins */}
          {pins.map((pin) => {
            const isSelected = pin.id === selectedPin;
            return (
              <div
                key={pin.id}
                style={{ top: pin.y, left: pin.x }}
                onClick={() => setSelectedPin(pin.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group"
              >
                {/* Ping wave */}
                <div
                  className="absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none"
                  style={{ backgroundColor: pin.color }}
                />

                {/* Tactile Pin */}
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-2.5 py-1 rounded-full border-2 border-[#14281D] flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-[#14281D] text-[#F2B705] shadow-hard-sm font-bold scale-110 z-40'
                      : 'bg-white text-[#14281D] hover:bg-[#F6F1E9]'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" style={{ color: isSelected ? '#F2B705' : pin.color }} />
                  <span className="font-mono text-[11px] font-bold whitespace-nowrap">
                    {pin.price}
                  </span>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Selected Item Detail Card */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePin.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white border-2 border-[#14281D] rounded-2xl p-5 shadow-hard space-y-4"
            >
              <div className="relative h-36 rounded-xl overflow-hidden border border-[#14281D] bg-[#F6F1E9]">
                <img
                  src={activePin.image}
                  alt={activePin.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 bg-[#14281D] text-[#F2B705] font-mono text-[10px] font-bold px-2 py-0.5 rounded-sm border border-[#14281D]">
                  {activePin.distance}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#E8590C]">
                    {activePin.category}
                  </span>
                  <span className="font-mono text-sm font-extrabold text-[#14281D]">
                    {activePin.price}
                  </span>
                </div>
                <h4 className="font-display text-lg font-bold text-[#14281D] mt-0.5">
                  {activePin.name}
                </h4>
                <div className="text-xs text-[#4A5B52] mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                  <span>{activePin.street} • Borrow from {activePin.owner}</span>
                </div>
              </div>

              <Link
                to="/explore"
                className="btn-tactile w-full py-2.5 rounded-xl bg-[#F2B705] text-[#14281D] font-bold text-xs uppercase tracking-wider border-2 border-[#14281D] shadow-hard-sm flex items-center justify-center gap-1.5"
              >
                <span>Request from {activePin.owner.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default NeighborhoodMapSection;