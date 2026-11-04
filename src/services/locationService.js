/**
 * InstantShare - Location Service
 *
 * Encapsulates browser Geolocation API interactions, error handling,
 * and fallback demo coordinates. Isolates location acquisition from React UI components.
 */

import { DEMO_LOCATION } from '../utils/geo';

export const LOCATION_STORAGE_KEY = 'instantshare_user_location';

export const locationService = {
  /**
   * Check if geolocation is supported by the user's browser
   */
  isGeolocationSupported: () => {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  },

  /**
   * Request user's current GPS position via browser Geolocation API
   * @param {Object} options Geolocation options
   * @returns {Promise<{lat: number, lng: number, accuracy: number, isDemo: boolean}>}
   */
  getCurrentPosition: (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!locationService.isGeolocationSupported()) {
        reject({
          code: 'NOT_SUPPORTED',
          message: 'Geolocation is not supported by your browser.',
        });
        return;
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
        ...options,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy || 0),
            isDemo: false,
            timestamp: position.timestamp || Date.now(),
            label: 'Your Current Location',
          };
          try {
            sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
          } catch (e) {
            // Ignore storage issues
          }
          resolve(loc);
        },
        (error) => {
          let code = 'UNKNOWN_ERROR';
          let message = 'Unable to determine your location.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              code = 'PERMISSION_DENIED';
              message =
                'Location permission was denied. You can enable it in your browser settings or use the sample demo location.';
              break;
            case error.POSITION_UNAVAILABLE:
              code = 'POSITION_UNAVAILABLE';
              message =
                'Location information is unavailable at this moment. You can try again or use the sample demo location.';
              break;
            case error.TIMEOUT:
              code = 'TIMEOUT';
              message = 'Location request timed out. Please try again.';
              break;
            default:
              break;
          }

          reject({ code, message, originalError: error });
        },
        defaultOptions
      );
    });
  },

  /**
   * Returns the predefined demo location for testing without real browser permission
   */
  getDemoLocation: () => {
    const loc = {
      lat: DEMO_LOCATION.lat,
      lng: DEMO_LOCATION.lng,
      accuracy: 10,
      isDemo: true,
      timestamp: Date.now(),
      label: DEMO_LOCATION.shortName,
      name: DEMO_LOCATION.name,
    };
    try {
      sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
    } catch (e) {
      // Ignore storage issues
    }
    return loc;
  },

  /**
   * Get cached location from current session if available
   */
  getCachedLocation: () => {
    try {
      const data = sessionStorage.getItem(LOCATION_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Clear stored location from session
   */
  clearLocation: () => {
    try {
      sessionStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch (e) {
      // Ignore storage issues
    }
  },
};

export default locationService;

