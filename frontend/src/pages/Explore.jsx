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
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-[#F2B705]/20 border border-[#14281D]/20 text-[11px] font-mono font-bold text-[#14281D] mb-1">
            <span>● LOCAL DIRECTORY</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#14281D] tracking-tight">
            Neighborhood Gear Shelf
          </h1>
          <p className="text-xs sm:text-sm text-[#14281D]/70 font-sans mt-1">
            {exploreMode === 'nearby' && hasLocation
              ? `Showing gear within ${radius}m walking distance (${items.length} items found)`
              : `Browse ${items.length} tools, cameras and gear ready to borrow today`}
          </p>
        </div>

        {/* View Switcher: All Items vs Nearby Walking Distance */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#FAF8F5] p-1.5 rounded-xl border-2 border-[#14281D] shadow-hard-sm">
          <button
            type="button"
            onClick={() => setExploreMode('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              exploreMode === 'all'
                ? 'bg-[#14281D] text-[#F6F1E9] shadow-xs'
                : 'text-[#14281D]/70 hover:text-[#14281D]'
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={handleToggleNearbyMode}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
              exploreMode === 'nearby'
                ? 'bg-[#E8590C] text-white shadow-xs'
                : 'text-[#14281D]/70 hover:text-[#14281D]'
            }`}
          >
            <Navigation2 className="w-3.5 h-3.5 text-[#F2B705] fill-[#F2B705]" />
            <span>Walking Distance ({radius}m)</span>
          </button>
        </div>
      </div>

      {/* PROMINENT LOCATION DISCOVERY BAR */}
      <div className="bg-[#FAF8F5] rounded-2xl border-2 border-[#14281D] p-4 shadow-hard flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-[#14281D] shadow-hard-sm ${
              hasLocation
                ? isDemoActive
                  ? 'bg-[#F2B705] text-[#14281D]'
                  : 'bg-[#E8590C] text-white'
                : 'bg-white text-[#14281D]'
            }`}
          >
            <MapPin className="w-5 h-5" />
          </div>

          <div>
            <div className="text-xs font-bold text-[#14281D] flex items-center gap-2 flex-wrap">
              <span>
                {locationStatus === 'locating'
                  ? 'Acquiring GPS location...'
                  : isDemoActive
                  ? 'Active Demo Hub: Green Park Main, South Delhi'
                  : hasLocation
                  ? 'GPS Location Active'
                  : 'Location not enabled'}
              </span>

              {isDemoActive && (
                <span className="text-[10px] bg-[#F2B705]/30 text-[#14281D] border border-[#14281D] px-2 py-0.2 rounded-full font-mono font-bold">
                  Demo Lane Active
                </span>
              )}
            </div>

            <div className="text-[11px] text-[#14281D]/70">
              {hasLocation ? (
                <span>
                  Filtering items within <strong className="font-mono text-[#14281D]">{radius}m</strong> • Sorted nearest to farthest
                </span>
              ) : (
                <span>Click "Use My Location" or "Try Demo Hub" to uncover gear you can walk over and borrow</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls & Radius Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Radius Selector Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#14281D]/60 font-mono font-bold uppercase">Radius:</span>
            <div className="inline-flex p-1 bg-white rounded-xl border-2 border-[#14281D]">
              {radiusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setRadius(opt.value);
                    setExploreMode('nearby');
                    if (!hasLocation) requestCurrentLocation();
                  }}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                    radius === opt.value
                      ? 'bg-[#14281D] text-[#F6F1E9]'
                      : 'text-[#14281D]/70 hover:text-[#14281D]'
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#14281D] hover:bg-[#E8590C] disabled:opacity-50 text-[#F6F1E9] rounded-xl text-xs font-bold border-2 border-[#14281D] shadow-hard-sm btn-tactile transition-colors cursor-pointer"
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
              className="px-3.5 py-2 text-xs font-bold bg-[#F2B705] hover:bg-[#e0a804] border-2 border-[#14281D] shadow-hard-sm btn-tactile text-[#14281D] rounded-xl transition-colors cursor-pointer"
            >
              Try Demo Hub
            </button>
          )}

          {hasLocation && (
            <button
              type="button"
              onClick={clearLocation}
              className="text-xs font-bold text-[#14281D]/60 hover:text-[#E8590C] px-2 py-1 underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Location Warning / Fallback message if denied */}
      {locationStatus === 'denied' && (
        <div className="p-4 rounded-2xl bg-[#F2B705]/15 border-2 border-[#14281D] shadow-hard-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#14281D]">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#E8590C] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-sm">Browser Location Denied</strong>
              <span className="text-[#14281D]/80">
                To discover equipment within 200m walking distance, allow location access in your browser or explore our sample demo hub in Green Park.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={useDemoLocation}
            className="px-4 py-2 bg-[#14281D] hover:bg-[#E8590C] text-[#F6F1E9] border-2 border-[#14281D] shadow-hard-sm btn-tactile rounded-xl font-bold transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
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
          placeholder="Search electric drill, mirrorless camera, camping tent, 4k projector..."
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
          className={`md:block md:col-span-1 bg-[#FAF8F5] p-5 rounded-2xl border-2 border-[#14281D] shadow-hard space-y-6 ${
            showMobileFilters ? 'block' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#14281D]/10">
            <h3 className="font-serif font-black text-base text-[#14281D] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#E8590C]" />
              <span>Filters</span>
            </h3>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-mono font-bold text-[#E8590C] hover:text-[#14281D] flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Sort Control */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-[#14281D] uppercase tracking-wider block">
              Sort Results By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl px-3 py-2 text-xs font-bold text-[#14281D] focus:outline-none cursor-pointer"
            >
              {hasLocation && <option value="distance">Distance: Nearest First</option>}
              <option value="newest">Recently Added</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Rental Type Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-[#14281D] uppercase tracking-wider block">
              Rental Duration
            </label>
            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border-2 border-[#14281D]">
              {['ALL', 'HOURLY', 'DAILY'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRentalType(type)}
                  className={`py-1.5 text-xs font-bold font-mono rounded-lg transition-colors cursor-pointer ${
                    rentalType === type
                      ? 'bg-[#14281D] text-[#F6F1E9]'
                      : 'text-[#14281D]/70 hover:text-[#14281D]'
                  }`}
                >
                  {type === 'ALL' ? 'All' : type === 'HOURLY' ? 'Hourly' : 'Daily'}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono font-bold text-[#14281D] uppercase tracking-wider block">
              Price Range (₹)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ₹"
                className="w-full px-3 py-2 text-xs font-mono font-medium bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none"
              />
              <span className="text-[#14281D] font-bold text-xs">—</span>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ₹"
                className="w-full px-3 py-2 text-xs font-mono font-medium bg-white border-2 border-[#14281D] shadow-hard-sm rounded-xl focus:outline-none"
              />
            </div>
          </div>

          {/* Availability Filter Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-[#14281D] select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 text-[#14281D] accent-[#14281D] rounded border-[#14281D] focus:ring-0"
              />
              <span>Available right now</span>
            </label>
          </div>
        </aside>

        {/* Items Grid & Empty State */}
        <main className="md:col-span-3">
          {isLoading ? (
            <LoadingSpinner
              label={
                exploreMode === 'nearby' && hasLocation
                  ? `Scanning gear within ${radius}m...`
                  : 'Opening the neighborhood shelf...'
              }
            />
          ) : items.length === 0 ? (
            <div className="bg-[#FAF8F5] rounded-2xl border-2 border-[#14281D] shadow-hard p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F2B705] border-2 border-[#14281D] shadow-hard-sm text-[#14281D] flex items-center justify-center mx-auto transform -rotate-3">
                <PackageSearch className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-black text-[#14281D]">
                  {exploreMode === 'nearby'
                    ? `Nothing on this lane within ${radius} meters`
                    : 'No matching gear found'}
                </h3>
                <p className="text-xs text-[#14281D]/70 max-w-sm mx-auto leading-relaxed font-sans">
                  {exploreMode === 'nearby'
                    ? `Try expanding your walking radius to 500m or browse the full neighborhood inventory.`
                    : `We couldn't find any items matching your filters. Try clearing your search or asking a neighbor.`}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {exploreMode === 'nearby' && radius < 500 && (
                  <button
                    type="button"
                    onClick={() => setRadius(500)}
                    className="px-5 py-2.5 bg-[#14281D] text-[#F6F1E9] text-xs font-bold rounded-xl border-2 border-[#14281D] shadow-hard-sm btn-tactile hover:bg-[#E8590C] transition-colors cursor-pointer"
                  >
                    Expand to 500m Radius
                  </button>
                )}

                {exploreMode === 'nearby' && (
                  <button
                    type="button"
                    onClick={() => setExploreMode('all')}
                    className="px-4 py-2.5 bg-white text-[#14281D] text-xs font-bold rounded-xl border-2 border-[#14281D] shadow-hard-sm btn-tactile hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    View All Items
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2.5 text-xs font-bold text-[#14281D]/70 hover:text-[#E8590C] underline cursor-pointer"
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
