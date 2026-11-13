import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldCheck, HeartHandshake } from 'lucide-react';
import { NeighborTrustSeal, TapeStrip } from './HandDrawnSVGs';

export const TrustSection = () => {
  const testimonials = [
    {
      id: 1,
      quote: "I needed a heavy hammer drill for two hours to hang floating oak shelves in our living room. Found Vikram 140m away on Block B. Picked it up in 4 minutes, cost ₹160 total instead of ₹4,500 retail.",
      author: "Aarav Sharma",
      role: "Photographer & Neighbor",
      location: "Green Park Main",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      itemRented: "Bosch Hammer Drill",
      rotation: "-1.5deg",
    },
    {
      id: 2,
      quote: "My camping tent was gathering dust in the loft 50 weeks a year. Now 4 local families have borrowed it for Himachal weekend trips. It paid for itself twice over, and I've met awesome people on our lane.",
      author: "Priya Patel",
      role: "DIY Explorer",
      location: "Market Lane",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      itemRented: "Quechua 4P Tent (Owner)",
      rotation: "1.8deg",
    },
    {
      id: 3,
      quote: "Hosted a backyard movie night for my daughter's birthday. Borrowed an Epson 1080p projector and 100-inch portable screen from Rohan down the street. Setup took 10 minutes. Incredible community trust.",
      author: "Sneha Kapoor",
      role: "Fitness Coach",
      location: "Park Extension",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
      itemRented: "Epson Movie Projector",
      rotation: "-1deg",
    },
  ];

  const counters = [
    { value: '184+', label: 'Items Listed on Block', accent: '#E8590C' },
    { value: '92', label: 'Verified Neighbors', accent: '#14281D' },
    { value: '340+', label: 'Rentals Completed', accent: '#F2B705' },
    { value: '₹1,400', label: 'Avg Saved per Project', accent: '#1E3A2F' },
  ];

  return (
    <div className="space-y-12">
      {/* Top Banner: Neighbor Trust Seal + Headline */}
      <div className="bg-[#FAF7F2] border-2 border-[#14281D] rounded-3xl p-6 sm:p-10 shadow-hard-lg flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14281D] text-[#F2B705] font-mono text-xs font-bold uppercase tracking-wider">
            <HeartHandshake className="w-3.5 h-3.5 text-[#E8590C]" />
            <span>Built on Real Neighborhood Trust</span>
          </div>

          <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-[#14281D] leading-tight">
            No massive warehouses. Just your neighbors lending great gear.
          </h3>

          <p className="text-sm text-[#4A5B52] leading-relaxed">
            Every neighbor is identity-verified with phone and address checks. Items are inspected on pickup and return. You borrow directly from people living on your block.
          </p>
        </div>

        {/* Rotating Seal (Custom Detail 1) */}
        <div className="flex-shrink-0">
          <NeighborTrustSeal size={130} />
        </div>
      </div>

      {/* Animated Counter Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {counters.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.1 }}
            className="bg-white border-2 border-[#14281D] rounded-2xl p-5 shadow-hard text-center sm:text-left flex flex-col justify-between"
          >
            <div className="font-mono text-3xl sm:text-4xl font-black text-[#14281D]">
              {stat.value}
            </div>
            <div className="font-mono text-xs font-bold text-[#4A5B52] uppercase tracking-wider mt-1">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Neighbor Polaroid / Index Card Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {testimonials.map((t) => (
          <motion.div
            key={t.id}
            whileHover={{ y: -4, rotate: 0, boxShadow: '6px 6px 0px #14281D' }}
            style={{ transform: `rotate(${t.rotation})` }}
            className="bg-white border-2 border-[#14281D] rounded-2xl p-6 shadow-hard flex flex-col justify-between relative group transition-transform"
          >
            <TapeStrip className="w-16 h-4 -top-2 left-8" rotate="-1deg" />

            <div className="space-y-4">
              <div className="flex items-center gap-1 text-[#E8590C]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="font-sans text-sm text-[#14281D] leading-relaxed italic">
                "{t.quote}"
              </p>
            </div>

            <div className="pt-4 border-t border-[#14281D]/15 mt-4 flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.author}
                className="w-10 h-10 rounded-xl object-cover border-2 border-[#14281D]"
              />
              <div>
                <div className="font-display font-bold text-sm text-[#14281D]">
                  {t.author}
                </div>
                <div className="text-[11px] text-[#4A5B52] font-mono">
                  {t.location} • <span className="text-[#E8590C] font-semibold">{t.itemRented}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrustSection;