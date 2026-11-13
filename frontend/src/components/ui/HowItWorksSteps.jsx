import React from 'react';
import { motion } from 'framer-motion';
import { Search, MessageSquareCheck, Footprints, RotateCcw } from 'lucide-react';

export const HowItWorksSteps = () => {
  const steps = [
    {
      number: '01',
      title: 'Spot gear on your block',
      description: 'Search tools, cameras, camping tents and party speakers living within walking distance of your front door.',
      icon: Search,
      tag: '50m - 500m radius',
      color: '#14281D',
    },
    {
      number: '02',
      title: 'Request in 30 seconds',
      description: 'Pick your start and end hours. Message your neighbor with your project timing. No retail deposit forms.',
      icon: MessageSquareCheck,
      tag: 'Instant confirmation',
      color: '#E8590C',
    },
    {
      number: '03',
      title: 'Walk across the street',
      description: 'Stroll over to their porch, gate, or apartment lobby. Grab the gear and get a quick demo if you need one.',
      icon: Footprints,
      tag: '2 min stroll',
      color: '#F2B705',
    },
    {
      number: '04',
      title: 'Return it & save hundreds',
      description: 'Finish your project, drop the item back safe, and leave a neighbor review. Zero buying cost, zero closet clutter.',
      icon: RotateCcw,
      tag: 'Repeat next weekend',
      color: '#1E3A2F',
    },
  ];

  return (
    <div className="relative">
      {/* 4 Connected Tactile Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -4, boxShadow: '6px 6px 0px #14281D' }}
              className="bg-white border-2 border-[#14281D] rounded-2xl p-6 shadow-hard flex flex-col justify-between relative group"
            >
              {/* Step Number Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-2xl font-black text-[#14281D] bg-[#FAF7F2] border-2 border-[#14281D] px-3 py-1 rounded-xl shadow-hard-sm">
                  {step.number}
                </span>

                <div className="w-10 h-10 rounded-xl bg-[#FAF7F2] border border-[#14281D] flex items-center justify-center text-[#14281D] group-hover:bg-[#F2B705] transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#E8590C]">
                  {step.tag}
                </div>
                <h3 className="font-display font-bold text-lg text-[#14281D] leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs text-[#4A5B52] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Step indicator arrow between cards */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 font-mono font-bold text-[#14281D]">
                  →
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default HowItWorksSteps;