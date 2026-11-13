import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  UtensilsCrossed,
  Wrench,
  Bike,
  PartyPopper,
  Armchair,
  Tent,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const categoryIcons = {
  All: LayoutGrid,
  Electronics: Camera,
  'Home and Kitchen': UtensilsCrossed,
  'Tools and Equipment': Wrench,
  'Sports and Fitness': Bike,
  'Event Equipment': PartyPopper,
  Furniture: Armchair,
  'Travel and Outdoor': Tent,
};

export const categoryCounts = {
  All: '38 items',
  Electronics: '8 nearby',
  'Home and Kitchen': '6 nearby',
  'Tools and Equipment': '11 nearby',
  'Sports and Fitness': '5 nearby',
  'Event Equipment': '4 nearby',
  Furniture: '4 nearby',
  'Travel and Outdoor': '7 nearby',
};

// Subtle varied rotations for an authentic human collage feel
const tileRotations = ['-1deg', '1.5deg', '-1.5deg', '1deg', '-1.2deg', '1.8deg', '-0.8deg', '1.2deg'];

export const CategoryFilter = ({
  categories = [],
  selectedCategory = 'All',
  onSelectCategory,
  variant = 'tiles', // 'tiles' (horizontal scrolling strip) | 'chips'
}) => {
  const scrollContainerRef = useRef(null);
  const allCategories = ['All', ...categories.filter((c) => c !== 'All')];

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (variant === 'tiles' || variant === 'cards') {
    return (
      <div className="relative group">
        {/* Navigation Arrows for smooth horizontal strip scrolling */}
        <div className="hidden sm:flex items-center gap-2 absolute -top-12 right-0 z-10">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white border-2 border-[#14281D] shadow-hard-sm flex items-center justify-center hover:bg-[#F2B705] transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-[#14281D]" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white border-2 border-[#14281D] shadow-hard-sm flex items-center justify-center hover:bg-[#F2B705] transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-[#14281D]" />
          </button>
        </div>

        {/* Horizontal Scrolling Strip with Large Tactile Tiles */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-2 px-1 scroll-smooth no-scrollbar scrollbar-none"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {allCategories.map((category, index) => {
            const Icon = categoryIcons[category] || LayoutGrid;
            const isSelected = selectedCategory === category;
            const rotation = isSelected ? '0deg' : tileRotations[index % tileRotations.length];

            return (
              <motion.button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                whileHover={{
                  scale: 1.05,
                  rotate: isSelected ? 0 : 2,
                  boxShadow: '6px 6px 0px #14281D',
                  y: -3,
                }}
                whileTap={{ scale: 0.96, x: 2, y: 2 }}
                style={{ transform: `rotate(${rotation})`, scrollSnapAlign: 'start' }}
                className={`relative flex-shrink-0 w-44 sm:w-48 p-4 rounded-2xl border-2 border-[#14281D] text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#14281D] text-white shadow-hard-lg font-bold'
                    : 'bg-white text-[#14281D] shadow-hard hover:border-[#14281D]'
                }`}
              >
                {/* Top Row: Icon + Count */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl border-2 border-[#14281D] flex items-center justify-center ${
                      isSelected ? 'bg-[#F2B705] text-[#14281D]' : 'bg-[#FAF7F2] text-[#14281D]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-[#E8590C] text-white border-white/20'
                        : 'bg-[#F6F1E9] text-[#4A5B52] border-[#14281D]/20'
                    }`}
                  >
                    {categoryCounts[category] || '5+ items'}
                  </span>
                </div>

                {/* Bottom Row: Category Name */}
                <div>
                  <div className="font-display font-bold text-base leading-tight">
                    {category}
                  </div>
                  <div
                    className={`text-[11px] font-mono mt-1 ${
                      isSelected ? 'text-[#F2B705]' : 'text-[#4A5B52]'
                    }`}
                  >
                    {category === 'All' ? 'View Everything →' : 'Browse aisle →'}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Chips variant for explore page
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
      {allCategories.map((category) => {
        const Icon = categoryIcons[category] || LayoutGrid;
        const isSelected = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold whitespace-nowrap transition-all border-2 border-[#14281D] cursor-pointer ${
              isSelected
                ? 'bg-[#14281D] text-[#F2B705] shadow-hard-sm'
                : 'bg-white text-[#14281D] hover:bg-[#FAF7F2]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{category}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;