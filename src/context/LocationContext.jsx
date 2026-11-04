import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import locationService from '../services/locationService';
import {
  DEFAULT_RADIUS,
  RADIUS_OPTIONS,
  calculateHaversineDistance,
  formatDistance,
  estimateWalkingTime,
  DEMO_LOCATION,
} from '../utils/geo';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => locationService.getCachedLocation());
  const [status, setStatus] = useState(() => {
    const cached = locationService.getCachedLocation();
    if (!cached) return 'idle';
    return cached.isDemo ? 'demo' : 'granted';
  });
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [error, setError] = useState(null);

  /**
   * Request live user GPS coordinates via browser Geolocation API
   */
  const requestCurrentLocation = useCallback(async () => {
    setStatus('locating');
    setError(null);
    try {
      const pos = await locationService.getCurrentPosition();
      setLocation(pos);
      setStatus('granted');
      return pos;
    } catch (err) {
      console.warn('Geolocation acquisition error:', err);
      setError(err.message || 'Unable to access your location.');
      if (err.code === 'PERMISSION_DENIED') {
        setStatus('denied');
      } else {
        setStatus('unavailable');
      }
      return null;
    }
  }, []);

  /**
   * Activate the fixed sample demo location (Green Park Hub)
   * Clearly marked with isDemo = true
   */
  const useDemoLocation = useCallback(() => {
    const demo = locationService.getDemoLocation();
    setLocation(demo);
    setStatus('demo');
    setError(null);
    return demo;
  }, []);

  /**
   * Clear active location
   */
  const clearLocation = useCallback(() => {
    locationService.clearLocation();
    setLocation(null);
    setStatus('idle');
    setError(null);
  }, []);

  /**
   * Calculate distance from active location to target item coordinates
   */
  const getDistanceToItem = useCallback(
    (itemLat, itemLng) => {
      if (!location || itemLat === undefined || itemLng === undefined) {
        return null;
      }
      const meters = calculateHaversineDistance(location.lat, location.lng, itemLat, itemLng);
      return {
        meters: Math.round(meters),
        formatted: formatDistance(meters),
        walkingTime: estimateWalkingTime(meters),
        isWithinRadius: meters <= radius,
      };
    },
    [location, radius]
  );

  return (
    <LocationContext.Provider
      value={{
        location,
        status,
        radius,
        setRadius,
        error,
        requestCurrentLocation,
        useDemoLocation,
        clearLocation,
        getDistanceToItem,
        radiusOptions: RADIUS_OPTIONS,
        demoLocationMeta: DEMO_LOCATION,
        isDemoActive: status === 'demo' || Boolean(location?.isDemo),
        hasLocation: Boolean(location),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;

