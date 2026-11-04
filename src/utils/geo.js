/**
 * InstantShare - Geolocation & Haversine Distance Utilities
 *
 * Implements the Haversine formula to compute geodesic distances between
 * two geographical points (latitude/longitude) on Earth.
 * Prepared for future Spring Boot spatial query integration.
 */

// Earth radius in meters
const EARTH_RADIUS_METERS = 6371000;

// Standard sample demo location (Green Park Market & Community Hub, New Delhi)
export const DEMO_LOCATION = {
  id: 'demo-green-park',
  name: 'Green Park Community Hub, New Delhi',
  shortName: 'Green Park Hub',
  area: 'Green Park Market, S-Block',
  city: 'New Delhi, NCR',
  lat: 28.5585,
  lng: 77.2029,
  isDemo: true,
  description: 'Sample neighborhood hub with high density of rentable tools & equipment within 500m.'
};

// Supported search radius options in meters (200m is the default)
export const RADIUS_OPTIONS = [
  { value: 100, label: '100 m', desc: 'Immediate block (~1 min walk)' },
  { value: 200, label: '200 m', desc: 'Walking radius (~2-3 min walk)' },
  { value: 300, label: '300 m', desc: 'Neighborhood (~4 min walk)' },
  { value: 500, label: '500 m', desc: 'Local vicinity (~6 min walk)' },
];

export const DEFAULT_RADIUS = 200; // 200 meters default

/**
 * Calculates the great-circle distance between two points in meters using the Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in meters
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    lat1 === null ||
    lon1 === null ||
    lat2 === null ||
    lon2 === null
  ) {
    return Infinity;
  }

  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Format distance in meters to user-friendly human string
 * e.g., 45m -> "45 m away", 145m -> "145 m away", 1250m -> "1.3 km away"
 * @param {number} meters
 * @returns {string}
 */
export function formatDistance(meters) {
  if (meters === undefined || meters === null || isNaN(meters) || !isFinite(meters)) {
    return 'Distance unknown';
  }

  if (meters < 10) {
    return 'Right here (<10 m)';
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m away`;
  }

  const km = (meters / 1000).toFixed(1);
  return `${km} km away`;
}

/**
 * Estimates walking time in minutes based on average 80 meters/minute pace (~4.8 km/h).
 * @param {number} meters
 * @returns {string}
 */
export function estimateWalkingTime(meters) {
  if (meters === undefined || meters === null || !isFinite(meters)) return '';
  const minutes = Math.max(1, Math.round(meters / 80));
  return `~${minutes} min walk`;
}

