import React from 'react';
import {
  Camera,
  UtensilsCrossed,
  Wrench,
  Bike,
  PartyPopper,
  Armchair,
  Tent,
  LayoutGrid,
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

export const CategoryFilter = ({
  categories = [],
  selectedCategory = 'All',
  onSelectCategory,
  variant = 'chips', // 'chips' | 'cards'
}) => {
  const allCategories = ['All', ...categories.filter((c) => c !== 'All')];

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {allCategories
          .filter((cat) => cat !== 'All')
          .map((category) => {
            const Icon = categoryIcons[category] || LayoutGrid;
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => onSelectCategory(category)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#236B45] bg-[#EEF3EE] text-[#236B45] shadow-xs font-semibold'
                    : 'border-[#E1E5E1] bg-white text-[#252B27] hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-[#236B45] text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium leading-tight">{category}</span>
              </button>
            );
          })}
      </div>
    );
  }

  // Chips horizontal scroll variant (great for explore filter bar)
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
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              isSelected
                ? 'bg-[#236B45] text-white shadow-xs'
                : 'bg-white border border-[#E1E5E1] text-[#252B27] hover:bg-[#EEF3EE] hover:border-[#236B45]/30'
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

