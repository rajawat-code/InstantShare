import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  FilterX,
  PackageSearch,
  Check,
  ChevronDown,
} from 'lucide-react';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import { CATEGORIES } from '../data/mockData';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dataVersion } = useUser();

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const [rentalType, setRentalType] = useState('ALL'); // 'ALL' | 'HOURLY' | 'DAILY'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'price-low' | 'price-high'

  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state if URL query params change externally
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat) {
      setSelectedCategory(urlCat);
    }
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null && urlSearch !== undefined) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Load items from API Service
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getItems({
          category: selectedCategory,
          search: searchTerm,
          rentalType,
          availableOnly,
          minPrice,
          maxPrice,
          sortBy,
        });
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [
    selectedCategory,
    searchTerm,
    rentalType,
    availableOnly,
    minPrice,
    maxPrice,
    sortBy,
    dataVersion,
  ]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    if (term) {
      searchParams.set('search', term);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setRentalType('ALL');
    setMinPrice('');
    setMaxPrice('');
    setAvailableOnly(false);
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'All' ||
    rentalType !== 'ALL' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    availableOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252B27] tracking-tight">
            Explore Rental Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Discover {items.length} community items available for flexible rent
          </p>
        </div>

        {/* Sort Dropdown & Mobile Filter Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 bg-white border border-[#E1E5E1] rounded-xl text-xs font-medium text-slate-700"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters {hasActiveFilters && '• Active'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E1E5E1] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#236B45] cursor-pointer"
            >
              <option value="newest">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search and Category Quick Chips */}
      <div className="space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name, camera, drill, tent, projector, or city..."
        />

        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          variant="chips"
        />
      </div>

      {/* Main Content Area: Sidebar Filters + Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar (and Mobile drawer) */}
        <aside
          className={`md:block md:col-span-1 bg-white p-5 rounded-2xl border border-[#E1E5E1] space-y-6 ${
            showMobileFilters ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-[#252B27] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#236B45]" />
              <span>Filter Items</span>
            </h3>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Rental Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Rental Duration Type
            </label>
            <div className="grid grid-cols-3 gap-1 bg-[#F8F8F5] p-1 rounded-xl border border-[#E1E5E1]">
              {['ALL', 'HOURLY', 'DAILY'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRentalType(type)}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    rentalType === type
                      ? 'bg-[#236B45] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'ALL' ? 'All' : type === 'HOURLY' ? 'Hourly' : 'Daily'}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Price Range (₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ₹"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#236B45]"
              />
              <span className="text-slate-400 text-xs">—</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ₹"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#236B45]"
              />
            </div>
          </div>

          {/* Availability Filter Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-[#236B45] rounded border-slate-300 focus:ring-[#236B45]"
              />
              <span>Available now only</span>
            </label>
          </div>
        </aside>

        {/* Items Grid & Empty State */}
        <main className="md:col-span-3">
          {isLoading ? (
            <LoadingSpinner label="Fetching available items..." />
          ) : items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E1E5E1] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EEF3EE] text-[#236B45] flex items-center justify-center mx-auto">
                <PackageSearch className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">No rental items found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We couldn't find any items matching your active search and filters. Try adjusting
                  your keywords or resetting filters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#236B45] hover:bg-[#1b5636] text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Explore;

