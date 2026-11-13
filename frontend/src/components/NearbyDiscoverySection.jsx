import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Navigation2,
  MapPin,
  Compass,
  Footprints,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useUser } from '../context/UserContext';
import apiService from '../services/apiService';
import ItemCard from './ItemCard';
import LoadingSpinner from './LoadingSpinner';

export const NearbyDiscoverySection = ({ title, subtitle, showExploreLink = true }) => {
  const {
    location,
    status,
    radius,
    setRadius,
    error,
    requestCurrentLocation,
    useDemoLocation,
    clearLocation,
    radiusOptions,
    demoLocationMeta,
    isDemoActive,
    hasLocation,
  } = useLocation();

  const { dataVersion } = useUser();
  const [nearbyItems, setNearbyItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  // Fetch nearby items whenever location or radius or data changes
  useEffect(() => {
    let isMounted = true;
    const fetchNearby = async () => {
      if (!location || location.lat === undefined || location.lng === undefined) {
        setNearbyItems([]);
        return;
      }

      try {
        setIsLoadingItems(true);
        const results = await apiService.getNearbyItems(location.lat, location.lng, radius);
        if (isMounted) {
          setNearbyItems(results);
        }
      } catch (err) {
        console.error('Failed to query nearby items:', err);
      } finally {
        if (isMounted) {
          setIsLoadingItems(false);
        }
      }
    };

    fetchNearby();

    return () => {
      isMounted = false;
    };
  }, [location, radius, dataVersion]);

  return (
    <section className="bg-[#FAF7F2] rounded-3xl border-2 border-[#14281D] shadow-hard-lg p-6 sm:p-8 space-y-6">
      {/* Top Header & Core Pitch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-[#14281D]/15">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#14281D] text-[#F2B705] border border-[#14281D] shadow-hard-sm">
            <Compass className="w-3.5 h-3.5 text-[#E8590C]" />
            <span>HYPERLOCAL WALKING DISCOVERY</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14281D]">
            {title || 'Find Equipment Near You (Within 200m)'}
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5B52]">
            {subtitle ||
              'Borrow ladders, drills, projectors, or bikes from people living right on your block.'}
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={requestCurrentLocation}
            disabled={status === 'locating'}
            className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8590C] hover:bg-[#d44e06] disabled:bg-slate-300 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl border-2 border-[#14281D] shadow-hard-sm cursor-pointer"
          >
            <Navigation2
              className={`w-3.5 h-3.5 ${status === 'locating' ? 'animate-spin' : ''}`}
            />
            <span>
              {status === 'locating'
                ? 'Acquiring GPS...'
                : hasLocation && !isDemoActive
                ? 'Refresh GPS Location'
                : 'Find Items Near Me'}
            </span>
          </button>

          {/* Fallback / Quick demo trigger */}
          {!hasLocation && (
            <button
              type="button"
              onClick={useDemoLocation}
              className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#FAF7F2] border-2 border-[#14281D] text-[#14281D] font-mono text-xs font-bold rounded-xl shadow-hard-sm cursor-pointer"
              title="Explore 100m - 500m items around the sample Green Park community hub"
            >
              <span>Try Demo Neighborhood</span>
            </button>
          )}

          {hasLocation && (
            <button
              type="button"
              onClick={clearLocation}
              className="px-3 py-2 text-xs font-mono font-bold text-[#4A5B52] hover:text-[#E8590C] transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Location Status Bar & Radius Controls */}
      <div className="bg-white rounded-2xl p-4 border-2 border-[#14281D] shadow-hard-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Indicator */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border-2 border-[#14281D] flex items-center justify-center flex-shrink-0 ${
              hasLocation
                ? isDemoActive
                  ? 'bg-[#F2B705] text-[#14281D]'
                  : 'bg-[#22c55e] text-[#14281D]'
                : 'bg-[#FAF7F2] text-[#4A5B52]'
            }`}
          >
            <MapPin className="w-5 h-5" />
          </div>

          <div>
            <div className="text-xs font-bold text-[#14281D] flex items-center gap-2 flex-wrap">
              <span>
                {status === 'locating'
                  ? 'Detecting your coordinates...'
                  : isDemoActive
                  ? 'Demo Community Active'
                  : hasLocation
                  ? 'Your Live Coordinates Detected'
                  : 'Location not set yet'}
              </span>

              {isDemoActive && (
                <span className="font-mono text-[9px] font-bold bg-[#F2B705] text-[#14281D] border border-[#14281D] px-2 py-0.2 rounded">
                  GREEN PARK HUB
                </span>
              )}

              {hasLocation && !isDemoActive && (
                <span className="font-mono text-[9px] font-bold bg-[#22c55e] text-[#14281D] border border-[#14281D] px-2 py-0.2 rounded">
                  GPS ACTIVE
                </span>
              )}
            </div>

            <div className="text-[11px] font-mono text-[#4A5B52] mt-0.5">
              {isDemoActive ? (
                <span>
                  {demoLocationMeta.name} • <em>Demonstrating items within 100m–500m</em>
                </span>
              ) : hasLocation ? (
                <span>
                  Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                </span>
              ) : (
                <span>Click "Find Items Near Me" or test with the sample demo hub</span>
              )}
            </div>
          </div>
        </div>

        {/* Radius Selector Pills (100m, 200m default, 300m, 500m) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-[#14281D] mr-1 flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5 text-[#E8590C]" />
            <span>Search Radius:</span>
          </span>

          <div className="inline-flex p-1 bg-[#FAF7F2] rounded-xl border-2 border-[#14281D]">
            {radiusOptions.map((opt) => {
              const isSelected = radius === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRadius(opt.value)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#14281D] text-[#F2B705] shadow-sm'
                      : 'text-[#4A5B52] hover:text-[#14281D] hover:bg-white'
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                  {opt.value === 200 && (
                    <span className="ml-1 text-[9px] text-[#F2B705]">*</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Warning / Error State for Permission Denied or Unavailable */}
      {status === 'denied' && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block font-display">Browser Location Access Denied</strong>
              <span>
                To discover walking-distance items, allow location permission in your browser or
                load the sample demo hub below to test the feature.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={useDemoLocation}
            className="btn-tactile px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-mono text-xs font-bold border-2 border-[#14281D] shadow-hard-sm cursor-pointer self-start sm:self-auto flex-shrink-0"
          >
            Use Demo Location
          </button>
        </div>
      )}

      {/* Nearby Items Results */}
      <div>
        {isLoadingItems ? (
          <LoadingSpinner label={`Searching for equipment within ${radius} meters...`} />
        ) : !hasLocation ? (
          /* Prompt to activate location */
          <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-[#14281D]/30 bg-white space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] text-[#14281D] border-2 border-[#14281D] shadow-hard-sm flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6 text-[#E8590C]" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#14281D]">
              Discover tools & gear within walking distance
            </h3>
            <p className="text-xs text-[#4A5B52] max-w-md mx-auto leading-relaxed">
              Find electric drills, cameras, ladders, or projectors just 1–3 minutes away from where
              you stand. No long drives, zero shipping delays.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={requestCurrentLocation}
                className="btn-tactile px-5 py-2.5 bg-[#14281D] text-[#F6F1E9] text-xs font-mono font-bold uppercase tracking-wider rounded-xl border-2 border-[#14281D] shadow-hard-sm cursor-pointer"
              >
                Find Items Near Me
              </button>
              <button
                type="button"
                onClick={useDemoLocation}
                className="btn-tactile px-4 py-2.5 bg-white border-2 border-[#14281D] text-[#14281D] text-xs font-mono font-bold rounded-xl shadow-hard-sm cursor-pointer"
              >
                Explore Demo Hub (Green Park)
              </button>
            </div>
          </div>
        ) : nearbyItems.length === 0 ? (
          /* Empty state for zero items within radius */
          <div className="text-center py-10 px-4 rounded-2xl border-2 border-[#14281D] bg-white shadow-hard space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#14281D] flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6 text-[#E8590C]" />
            </div>
            <h3 className="font-display text-lg font-bold text-[#14281D]">
              No items listed within {radius} meters of your location
            </h3>
            <p className="text-xs text-[#4A5B52] max-w-md mx-auto leading-relaxed">
              We couldn't locate rentable gear within {radius}m. Try expanding your walking radius,
              or test the sample community hub where items are clustered.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {radius < 500 && (
                <button
                  type="button"
                  onClick={() => setRadius(500)}
                  className="btn-tactile px-4 py-2 bg-[#14281D] text-[#F2B705] font-mono text-xs font-bold rounded-xl border-2 border-[#14281D] shadow-hard-sm cursor-pointer"
                >
                  Expand Radius to 500m
                </button>
              )}
              {!isDemoActive && (
                <button
                  type="button"
                  onClick={useDemoLocation}
                  className="btn-tactile px-4 py-2 bg-white border-2 border-[#14281D] text-[#14281D] font-mono text-xs font-bold rounded-xl shadow-hard-sm cursor-pointer"
                >
                  Switch to Sample Demo Hub
                </button>
              )}
              <Link
                to="/explore"
                className="px-4 py-2 text-xs font-mono font-bold text-[#E8590C] hover:underline"
              >
                Browse All Marketplace Items →
              </Link>
            </div>
          </div>
        ) : (
          /* Grid of Nearby Items sorted by distance */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#4A5B52] px-1">
              <span className="font-bold text-[#14281D]">
                Found <strong className="text-[#E8590C]">{nearbyItems.length} items</strong> within{' '}
                {radius}m • <em>Sorted nearest to farthest</em>
              </span>
              {showExploreLink && (
                <Link
                  to={`/explore?nearby=true&radius=${radius}`}
                  className="text-[#E8590C] font-bold hover:underline inline-flex items-center gap-1 uppercase tracking-wider"
                >
                  <span>View in Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyItems.map((item) => (
                <ItemCard key={item.id} item={item} showWalkTime={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NearbyDiscoverySection;