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
    <section className="bg-white rounded-3xl border border-[#E1E5E1] shadow-sm p-6 sm:p-8 space-y-6">
      {/* Top Header & Core Pitch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF3EE] text-[#236B45] border border-[#DCFCE7]">
            <Compass className="w-3.5 h-3.5" />
            <span>Hyperlocal Walking Discovery (200m)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#252B27] tracking-tight">
            {title || 'Find Equipment Near You (Within 200m)'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#236B45] hover:bg-[#1b5636] disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F8F8F5] hover:bg-slate-100 border border-[#E1E5E1] text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              title="Explore 100m - 500m items around the sample Green Park community hub"
            >
              <span>Try Demo Neighborhood</span>
            </button>
          )}

          {hasLocation && (
            <button
              type="button"
              onClick={clearLocation}
              className="px-3 py-2.5 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Location Status Bar & Radius Controls */}
      <div className="bg-[#F8F8F5] rounded-2xl p-4 border border-[#E1E5E1] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status Indicator */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              hasLocation
                ? isDemoActive
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-[#236B45]'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            <MapPin className="w-5 h-5" />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>
                {status === 'locating'
                  ? 'Detecting your coordinates...'
                  : isDemoActive
                  ? 'Demo Location Active'
                  : hasLocation
                  ? 'Your Live Location Detected'
                  : 'Location not set yet'}
              </span>

              {isDemoActive && (
                <span className="text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.2 rounded-full">
                  Sample Data Hub
                </span>
              )}

              {hasLocation && !isDemoActive && (
                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.2 rounded-full">
                  GPS Active
                </span>
              )}
            </div>

            <div className="text-[11px] text-slate-500 mt-0.5">
              {isDemoActive ? (
                <span>
                  {demoLocationMeta.name} • <em>Demonstrating items within 100m–300m</em>
                </span>
              ) : hasLocation ? (
                <span className="font-medium text-slate-700">
                  {location.areaName || location.displayArea || location.name || 'Your Nearby Neighborhood'}
                </span>
              ) : (
                <span>Click "Find Items Near Me" or test with the sample demo hub</span>
              )}
            </div>
          </div>
        </div>

        {/* Radius Selector Pills (100m, 200m default, 300m, 500m) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
            <Footprints className="w-3.5 h-3.5 text-slate-400" />
            <span>Search Radius:</span>
          </span>

          <div className="inline-flex p-1 bg-white rounded-xl border border-[#E1E5E1]">
            {radiusOptions.map((opt) => {
              const isSelected = radius === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRadius(opt.value)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#236B45] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                  {opt.value === 200 && (
                    <span className="ml-1 text-[9px] opacity-80">(Default)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Warning / Error State for Permission Denied or Unavailable */}
      {status === 'denied' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">Browser Location Access Denied</strong>
              <span>
                To discover walking-distance items, allow location permission in your browser or
                load the sample demo hub below to test the feature.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={useDemoLocation}
            className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-semibold transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
          >
            Use Demo Location
          </button>
        </div>
      )}

      {status === 'unavailable' && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block">GPS Location Unavailable</strong>
              <span>{error || 'Unable to retrieve location coordinates at this moment.'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={useDemoLocation}
            className="px-4 py-2 bg-[#236B45] text-white rounded-xl font-semibold transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
          >
            Use Sample Demo Hub
          </button>
        </div>
      )}

      {/* Nearby Items Results */}
      <div>
        {isLoadingItems ? (
          <LoadingSpinner label={`Searching for equipment within ${radius} meters...`} />
        ) : !hasLocation ? (
          /* Prompt to activate location */
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#E1E5E1] bg-[#F8F8F5]/60 space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EEF3EE] text-[#236B45] flex items-center justify-center mx-auto">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              Discover tools & gear within walking distance
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Find electric drills, cameras, ladders, or projectors just 1–3 minutes away from where
              you stand. No long drives, zero shipping delays.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={requestCurrentLocation}
                className="px-5 py-2.5 bg-[#236B45] hover:bg-[#1b5636] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Find Items Near Me
              </button>
              <button
                type="button"
                onClick={useDemoLocation}
                className="px-4 py-2.5 bg-white border border-[#E1E5E1] hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
              >
                Explore Demo Hub (Green Park)
              </button>
            </div>
          </div>
        ) : nearbyItems.length === 0 ? (
          /* Empty state for zero items within radius */
          <div className="text-center py-10 px-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              No items listed within {radius} meters of your location
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              We couldn't locate rentable gear within {radius}m. Try expanding your walking radius,
              or test the sample community hub where items are clustered.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {radius < 2000 && (
                <button
                  type="button"
                  onClick={() => setRadius(radius < 300 ? 500 : radius < 1000 ? 1000 : 2000)}
                  className="px-4 py-2 bg-[#236B45] text-white text-xs font-semibold rounded-xl hover:bg-[#1b5636] transition-colors cursor-pointer"
                >
                  Expand Radius to {radius < 300 ? '500 m' : radius < 1000 ? '1 km' : '2 km'}
                </button>
              )}
              {!isDemoActive && (
                <button
                  type="button"
                  onClick={useDemoLocation}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Switch to Sample Demo Hub
                </button>
              )}
              <Link
                to="/explore"
                className="px-4 py-2 text-xs font-medium text-[#236B45] hover:underline"
              >
                Browse All Marketplace Items →
              </Link>
            </div>
          </div>
        ) : (
          /* Grid of Nearby Items sorted by distance */
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="font-medium text-slate-800">
                Found <strong className="text-[#236B45]">{nearbyItems.length} items</strong> within{' '}
                {radius}m • <em>Sorted nearest to farthest</em>
              </span>
              {showExploreLink && (
                <Link
                  to={`/explore?nearby=true&radius=${radius}`}
                  className="text-[#236B45] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>View all in Explore</span>
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

