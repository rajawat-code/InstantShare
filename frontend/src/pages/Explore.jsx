import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  FilterX,
  PackageSearch,
  Check,
  ChevronDown,
  Navigation2,
  MapPin,
  Compass,
  Footprints,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import ItemCard from '../components/ItemCard';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import { CATEGORIES } from '../data/mockData';
import apiService from '../services/apiService';
import { useUser } from '../context/UserContext';
import { useLocation } from '../context/LocationContext';

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { dataVersion } = useUser();
  const {
    location,
    status: locationStatus,
    radius,
    setRadius,
    error: locationError,
    requestCurrentLocation,
    useDemoLocation,
    clearLocation,
    radiusOptions,
    isDemoActive,
    hasLocation,
  } = useLocation();

  // Search & filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'All'
  );
  const [rentalType, setRentalType] = useState('ALL'); // 'ALL' | 'HOURLY' | 'DAILY'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Mode: 'all' or 'nearby'
  const [exploreMode, setExploreMode] = useState(
    searchParams.get('nearby') === 'true' || hasLocation ? 'nearby' : 'all'
  );

  const [sortBy, setSortBy] = useState(hasLocation ? 'distance' : 'newest');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync with URL query parameters
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat) {
      setSelectedCategory(urlCat);
    }
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null && urlSearch !== undefined) {
      setSearchTerm(urlSearch);
    }
    if (searchParams.get('nearby') === 'true') {
      setExploreMode('nearby');
      if (!hasLocation) {
        requestCurrentLocation();
      }
    }
  }, [searchParams]);

  // Adjust sort default if location is acquired
  useEffect(() => {
    if (hasLocation && exploreMode === 'nearby') {
      setSortBy('distance');
    }
  }, [hasLocation, exploreMode]);

  // Load items from API Service
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setIsLoading(true);

        if (exploreMode === 'nearby' && hasLocation) {
          // Use the dedicated nearby query (Haversine + radius filter)
          const nearbyData = await apiService.getNearbyItems(
            location.lat,
            location.lng,
            radius,
            {
              category: selectedCategory,
              search: searchTerm,
              availableOnly,
            }
          );

          // Apply client-side price and rental type filters if needed
          let filtered = nearbyData;
          if (rentalType !== 'ALL') {
            filtered = filtered.filter((i) => i.rentalType === rentalType);
          }
          if (minPrice !== '') {
            filtered = filtered.filter((i) => i.rentalPrice >= Number(minPrice));
          }
          if (maxPrice !== '') {
            filtered = filtered.filter((i) => i.rentalPrice <= Number(maxPrice));
          }

          if (sortBy === 'price-low') {
            filtered.sort((a, b) => a.rentalPrice - b.rentalPrice);
          } else if (sortBy === 'price-high') {
            filtered.sort((a, b) => b.rentalPrice - a.rentalPrice);
          } else {
            // Default nearby sort: strictly distance nearest to farthest
            filtered.sort((a, b) => a.distanceMeters - b.distanceMeters);
          }

          setItems(filtered);
        } else {
          // General marketplace query with optional distance annotation
          const data = await apiService.getItems({
            category: selectedCategory,
            search: searchTerm,
            rentalType,
            availableOnly,
            minPrice,
            maxPrice,
            sortBy,
            userLat: location?.lat,
            userLng: location?.lng,
          });
          setItems(data);
        }
      } catch (err) {
        console.error('Error fetching items in Explore:', err);
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
    exploreMode,
    hasLocation,
    location,
    radius,
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
    setSortBy(hasLocation ? 'distance' : 'newest');
    setSearchParams({});
  };

  const handleToggleNearbyMode = () => {
    if (exploreMode === 'all') {
      setExploreMode('nearby');
      if (!hasLocation) {
        requestCurrentLocation();
      }
    } else {
      setExploreMode('all');
    }
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
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#252B27] tracking-tight">
            Explore Rental Items
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {exploreMode === 'nearby' && hasLocation
              ? `Showing items within ${radius}m walking distance (${items.length} items found)`
              : `Browse ${items.length} community items available for rent`}
          </p>
        </div>

        {/* View Switcher: All Items vs Nearby Walking Distance */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-white p-1 rounded-2xl border border-[#E1E5E1] shadow-xs">
          <button
            type="button"
            onClick={() => setExploreMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              exploreMode === 'all'
                ? 'bg-[#236B45] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={handleToggleNearbyMode}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              exploreMode === 'nearby'
                ? 'bg-[#236B45] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation2 className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
            <span>Nearby ({radius}m)</span>
          </button>
        </div>
      </div>

      {/* PROMINENT LOCATION DISCOVERY BAR */}
      <div className="bg-white rounded-2xl border border-[#E1E5E1] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              hasLocation
                ? isDemoActive
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-[#236B45]'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <MapPin className="w-5 h-5" />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-2 flex-wrap">
              <span>
                {locationStatus === 'locating'
                  ? 'Acquiring GPS location...'
                  : isDemoActive
                  ? 'Area: Green Park, New Delhi'
                  : hasLocation
                  ? `Area: ${location?.areaName || location?.displayArea || 'Your Nearby Neighborhood'}`
                  : 'Location not enabled'}
              </span>

              {isDemoActive && (
                <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.2 rounded-full font-medium">
                  Sample Data Hub
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500">
              {hasLocation ? (
                <span>
                  Showing items within <strong>{radius}m</strong> of{' '}
                  <strong className="text-slate-700">
                    {location?.areaName || location?.displayArea || (isDemoActive ? 'Green Park, New Delhi' : 'your neighborhood')}
                  </strong>
                </span>
              ) : (
                <span>Click "Use My Location" to uncover gear you can walk over and borrow</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Radius Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Radius Selector Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Radius:</span>
            <div className="inline-flex p-0.5 bg-[#F8F8F5] rounded-xl border border-[#E1E5E1]">
              {radiusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setRadius(opt.value);
                    setExploreMode('nearby');
                    if (!hasLocation) requestCurrentLocation();
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    radius === opt.value
                      ? 'bg-[#236B45] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location button */}
          <button
            type="button"
            onClick={requestCurrentLocation}
            disabled={locationStatus === 'locating'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#236B45] hover:bg-[#1b5636] disabled:bg-slate-300 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Navigation2
              className={`w-3.5 h-3.5 ${locationStatus === 'locating' ? 'animate-spin' : ''}`}
            />
            <span>
              {locationStatus === 'locating'
                ? 'Locating...'
                : hasLocation && !isDemoActive
                ? 'Refresh GPS'
                : 'Use My Location'}
            </span>
          </button>

          {!hasLocation && (
            <button
              type="button"
              onClick={useDemoLocation}
              className="px-3 py-2 text-xs font-medium bg-[#F8F8F5] hover:bg-slate-100 border border-[#E1E5E1] text-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Try Demo Hub
            </button>
          )}

          {hasLocation && (
            <button
              type="button"
              onClick={clearLocation}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Location Warning / Fallback message if denied */}
      {locationStatus === 'denied' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Browser Location Permission Denied</strong>
              <span>
                To discover equipment within 200m walking distance, permit location access or use the
                sample demo neighborhood.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={useDemoLocation}
            className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
          >
            Explore Sample Demo Hub
          </button>
        </div>
      )}

      {/* Search and Category Quick Chips */}
      <div className="space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search electric drill, camera, camping tent, projector..."
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
        {/* Desktop Filter Sidebar */}
        <aside
          className={`md:block md:col-span-1 bg-white p-5 rounded-2xl border border-[#E1E5E1] space-y-6 ${
            showMobileFilters ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-semibold text-sm text-[#252B27] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#236B45]" />
              <span>Filters</span>
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

          {/* Sort Control */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Sort Results By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#F8F8F5] border border-[#E1E5E1] rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-[#236B45] cursor-pointer"
            >
              {hasLocation && <option value="distance">Distance: Nearest First</option>}
              <option value="newest">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Rental Type Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Rental Duration
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
            <LoadingSpinner
              label={
                exploreMode === 'nearby' && hasLocation
                  ? `Scanning items within ${radius}m...`
                  : 'Loading marketplace items...'
              }
            />
          ) : items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E1E5E1] p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EEF3EE] text-[#236B45] flex items-center justify-center mx-auto">
                <PackageSearch className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900">
                  {exploreMode === 'nearby'
                    ? `No items found within ${radius} meters`
                    : 'No rental items found'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {exploreMode === 'nearby'
                    ? `Try expanding your search radius up to 2 km or browse all marketplace items.`
                    : `We couldn't find any items matching your active search and filters. Try adjusting your keywords.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {exploreMode === 'nearby' && radius < 2000 && (
                  <button
                    type="button"
                    onClick={() => setRadius(radius < 300 ? 500 : radius < 1000 ? 1000 : 2000)}
                    className="px-4 py-2 bg-[#236B45] text-white text-xs font-semibold rounded-xl hover:bg-[#1b5636] transition-colors cursor-pointer"
                  >
                    Expand Radius to {radius < 300 ? '500 m' : radius < 1000 ? '1 km' : '2 km'}
                  </button>
                )}

                {exploreMode === 'nearby' && (
                  <button
                    type="button"
                    onClick={() => setExploreMode('all')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    View All Marketplace Items
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
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
