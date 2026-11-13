/**
 * InstantShare - Unified API Service Layer
 * Fully connected to Spring Boot REST API (/api)
 * Features:
 *   - Authentication (/api/auth/login, /api/auth/register)
 *   - User Profile (/api/users/me)
 *   - Categories (/api/categories)
 *   - Hyperlocal GPS Equipment (/api/equipment/nearby, /api/equipment, /api/equipment/{id}, /api/equipment/my)
 *   - Rental Lifecycle (/api/rentals, /api/rentals/my, /api/rentals/{id}/decision, /api/rentals/{id}/handover, /api/rentals/{id}/return)
 *   - Demo Mode Payment Gateway (/api/payments/checkout, /api/payments/demo-confirm, /api/payments/status/{rentalId})
 *   - Reviews & Ratings (/api/reviews, /api/reviews/user/{userId})
 *   - Automatic JWT token injection via Axios interceptors
 *   - Seamless fallback to local storage if Spring Boot server is offline
 */

import axios from 'axios';
import storageService from './storageService';
import { calculateHaversineDistance, formatDistance, estimateWalkingTime } from '../utils/geo';

// Determine base API endpoint: supports custom runtime URL, environment variable, or Vite proxy '/api'
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('instantshare_custom_api_url');
    if (custom && custom.trim()) return custom.trim().replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }
  return '/api';
};

export const setApiBaseUrl = (newUrl) => {
  if (!newUrl || !newUrl.trim()) {
    localStorage.removeItem('instantshare_custom_api_url');
  } else {
    localStorage.setItem('instantshare_custom_api_url', newUrl.trim().replace(/\/+$/, ''));
  }
  apiClient.defaults.baseURL = getApiBaseUrl();
};

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Request interceptor: dynamically apply active baseURL and attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    const token = localStorage.getItem('instantshare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap Spring Boot ApiResponse envelope { success: true, data: ... }
apiClient.interceptors.response.use(
  (response) => {
    // If response body has the standard envelope { success, data }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Helpful log for debugging backend connectivity
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.warn('[InstantShare API] Backend unreachable at', getApiBaseUrl(), '- using fallback.');
    }
    return Promise.reject(error);
  }
);

// State tracking for backend connectivity
let isBackendOnline = false;
let hasCheckedHealth = false;

// Helper to simulate slight latency when running in local storage fallback
const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// Category name-to-ID mapping table for Spring Boot backend
const CATEGORY_MAP = {
  'Power Tools': 1,
  'Hand Tools': 2,
  'Ladders & Scaffolding': 3,
  'Lawn & Gardening': 4,
  'Cameras & Audio/Video': 5,
  'Camping & Outdoor Gear': 6,
  'Cleaning & Pressure Washers': 7,
  'Electronics': 5,
  'Home and Kitchen': 2,
  'Tools and Equipment': 1,
  'Sports and Fitness': 6,
  'Event Equipment': 5,
};

/**
 * Adapter: Transforms backend Equipment entity to frontend Item model
 */
export const mapBackendEquipmentToItem = (eq) => {
  if (!eq) return null;
  const rawPrice = Number(eq.price || eq.rentalPrice || 0);
  const rawDeposit = Number(eq.securityDeposit ?? eq.deposit ?? 0);
  const imageUrl =
    (eq.imageUrls && eq.imageUrls[0]) ||
    (eq.images && eq.images[0]?.imageUrl) ||
    eq.imageUrl ||
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80';

  const lat = eq.latitude ?? eq.lat ?? 12.914142;
  const lng = eq.longitude ?? eq.lng ?? 77.636928;
  const dist = eq.distanceMeters ?? null;

  return {
    id: eq.id,
    name: eq.title || eq.name,
    description: eq.description || '',
    category: eq.categoryName || eq.category || 'Tools and Equipment',
    categoryId: eq.categoryId || CATEGORY_MAP[eq.categoryName] || 1,
    rentalPrice: rawPrice,
    rentalType: (eq.priceUnit === 'HOUR' ? 'HOURLY' : 'DAILY') || eq.rentalType || 'DAILY',
    deposit: rawDeposit,
    imageUrl,
    imageUrls: eq.imageUrls || (eq.imageUrl ? [eq.imageUrl] : [imageUrl]),
    location: eq.displayArea || eq.location || 'Green Park, New Delhi',
    lat,
    lng,
    distanceMeters: dist,
    distanceFormatted: dist !== null ? formatDistance(dist) : undefined,
    walkingTime: dist !== null ? estimateWalkingTime(dist) : undefined,
    ownerId: eq.ownerId || eq.ownerUserId || 1,
    ownerName: eq.ownerName || 'Verified Neighbor',
    available: eq.status === 'ACTIVE' || eq.available === true,
    condition: eq.condition || 'Good',
    rating: eq.rating || 4.9,
    reviewsCount: eq.reviewsCount || 12,
  };
};

/**
 * Adapter: Transforms frontend Item model to backend EquipmentRequest payload
 */
export const mapItemToBackendEquipmentRequest = (item) => {
  const catId = item.categoryId || CATEGORY_MAP[item.category] || 1;
  return {
    title: item.name,
    description: item.description,
    categoryId: catId,
    price: Number(item.rentalPrice),
    priceUnit: item.rentalType === 'HOURLY' ? 'HOUR' : 'DAY',
    securityDeposit: Number(item.deposit || 0),
    latitude: Number(item.lat || 12.914142),
    longitude: Number(item.lng || 77.636928),
    displayArea: item.location || 'Sector 1, Neighborhood',
    imageUrls: item.imageUrls || (item.imageUrl ? [item.imageUrl] : []),
  };
};

/**
 * Adapter: Transforms backend Rental entity to frontend Booking model
 */
export const mapBackendRentalToBooking = (rental) => {
  if (!rental) return null;
  return {
    id: rental.id,
    itemId: rental.equipmentId || rental.itemId,
    itemName: rental.equipmentTitle || rental.itemName || 'Equipment Item',
    itemImage:
      rental.itemImage ||
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    renterId: rental.renterId,
    renterName: rental.renterName || 'Renter',
    renterEmail: rental.renterEmail,
    renterPhone: rental.renterPhone,
    ownerId: rental.ownerId,
    ownerName: rental.ownerName || 'Owner',
    startDate: rental.startAt || rental.startDate,
    endDate: rental.endAt || rental.endDate,
    status: rental.status,
    totalAmount: Number(rental.totalPayable ?? rental.quotedAmount ?? rental.totalAmount ?? 0),
    quotedAmount: Number(rental.quotedAmount ?? 0),
    platformFee: Number(rental.platformFee ?? 0),
    deposit: Number(rental.securityDeposit ?? rental.deposit ?? 0),
    duration: rental.duration || 'Daily rental',
    paymentStatus: rental.paymentStatus,
    notes: rental.notes || '',
    createdAt: rental.createdAt,
  };
};

export const apiService = {
  // ---------------------------------------------------------------------------
  // Backend Health & Connectivity Check
  // ---------------------------------------------------------------------------
  checkBackendHealth: async () => {
    try {
      const activeBase = getApiBaseUrl();
      // Fast probe to check if backend Spring Boot is listening
      const response = await axios.get(`${activeBase}/categories`, { timeout: 3500 });
      isBackendOnline = response.status === 200;
      hasCheckedHealth = true;
      return isBackendOnline;
    } catch {
      isBackendOnline = false;
      hasCheckedHealth = true;
      return false;
    }
  },

  getBaseUrl: () => getApiBaseUrl(),
  setBaseUrl: (url) => setApiBaseUrl(url),
  isOnline: () => isBackendOnline,

  // ---------------------------------------------------------------------------
  // 1. Authentication & User Profile APIs
  // ---------------------------------------------------------------------------
  login: async (email, password) => {
    try {
      const data = await apiClient.post('/auth/login', { email, password });
      if (data && data.token) {
        localStorage.setItem('instantshare_token', data.token);
        localStorage.setItem('instantshare_auth_user', JSON.stringify(data));
      }
      return data;
    } catch (err) {
      console.warn('Backend login failed, using local auth mock fallback:', err.message);
      // Fallback: match local mock user by email
      const users = storageService.getUsers();
      const matched = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        return {
          userId: matched.id,
          name: matched.name,
          email: matched.email,
          role: matched.role || 'RENTER',
          token: 'mock-jwt-token-fallback',
        };
      }
      throw err;
    }
  },

  register: async (userData) => {
    try {
      const data = await apiClient.post('/auth/register', userData);
      if (data && data.token) {
        localStorage.setItem('instantshare_token', data.token);
        localStorage.setItem('instantshare_auth_user', JSON.stringify(data));
      }
      return data;
    } catch (err) {
      console.warn('Backend register failed, using local storage:', err.message);
      return storageService.addUser(userData);
    }
  },

  logout: () => {
    localStorage.removeItem('instantshare_token');
    localStorage.removeItem('instantshare_auth_user');
  },

  getCurrentUserProfile: async () => {
    try {
      return await apiClient.get('/users/me');
    } catch {
      return storageService.getCurrentUser();
    }
  },

  updateCurrentUserProfile: async (updateData) => {
    try {
      return await apiClient.put('/users/me', updateData);
    } catch {
      return storageService.updateCurrentUser(updateData);
    }
  },

  // ---------------------------------------------------------------------------
  // 2. Categories API
  // ---------------------------------------------------------------------------
  getCategories: async () => {
    try {
      const categories = await apiClient.get('/categories');
      if (Array.isArray(categories) && categories.length > 0) {
        return categories;
      }
    } catch {
      // Fallback to static list
    }
    return [
      { id: 1, name: 'Power Tools', active: true },
      { id: 2, name: 'Hand Tools', active: true },
      { id: 3, name: 'Ladders & Scaffolding', active: true },
      { id: 4, name: 'Lawn & Gardening', active: true },
      { id: 5, name: 'Cameras & Audio/Video', active: true },
      { id: 6, name: 'Camping & Outdoor Gear', active: true },
      { id: 7, name: 'Cleaning & Pressure Washers', active: true },
    ];
  },

  // ---------------------------------------------------------------------------
  // 3. Equipment & Hyperlocal Discovery APIs
  // ---------------------------------------------------------------------------
  getItems: async (filters = {}) => {
    try {
      // Try calling Spring Boot backend
      let backendList = [];
      const catId = filters.category && filters.category !== 'All' ? CATEGORY_MAP[filters.category] : undefined;

      // If user passed coordinates, use the dedicated nearby endpoint
      if (filters.userLat !== undefined && filters.userLng !== undefined) {
        const nearbyRes = await apiClient.get('/equipment/nearby', {
          params: {
            lat: filters.userLat,
            lon: filters.userLng,
            radius: filters.radius || 300,
            category: catId,
          },
        });
        backendList = nearbyRes?.items || [];
      } else {
        // Query general equipment endpoint
        backendList = await apiClient.get('/equipment', {
          params: {
            category: catId,
            search: filters.search || undefined,
          },
        });
      }

      if (Array.isArray(backendList) && backendList.length > 0) {
        isBackendOnline = true;
        let items = backendList.map(mapBackendEquipmentToItem);

        // Apply any remaining client filters
        if (filters.search) {
          const q = filters.search.toLowerCase().trim();
          items = items.filter(
            (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
          );
        }
        if (filters.rentalType && filters.rentalType !== 'ALL') {
          items = items.filter((i) => i.rentalType === filters.rentalType);
        }
        if (filters.availableOnly) {
          items = items.filter((i) => i.available === true);
        }
        if (filters.minPrice !== undefined && filters.minPrice !== '') {
          items = items.filter((i) => i.rentalPrice >= Number(filters.minPrice));
        }
        if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
          items = items.filter((i) => i.rentalPrice <= Number(filters.maxPrice));
        }

        // Sorting
        if (filters.sortBy === 'price-low') {
          items.sort((a, b) => a.rentalPrice - b.rentalPrice);
        } else if (filters.sortBy === 'price-high') {
          items.sort((a, b) => b.rentalPrice - a.rentalPrice);
        } else if (filters.sortBy === 'distance') {
          items.sort((a, b) => (a.distanceMeters || Infinity) - (b.distanceMeters || Infinity));
        }

        return items;
      }
    } catch {
      // Spring Boot backend offline or returned error -> fall back to local storage
    }

    await delay(60);
    let items = storageService.getItems();

    if (filters.category && filters.category !== 'All') {
      items = items.filter((i) => i.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.search) {
      const query = filters.search.toLowerCase().trim();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          i.description.toLowerCase().includes(query) ||
          i.location.toLowerCase().includes(query)
      );
    }
    if (filters.rentalType && filters.rentalType !== 'ALL') {
      items = items.filter((i) => i.rentalType === filters.rentalType);
    }
    if (filters.availableOnly) {
      items = items.filter((i) => i.available === true);
    }
    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      items = items.filter((i) => i.rentalPrice >= Number(filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      items = items.filter((i) => i.rentalPrice <= Number(filters.maxPrice));
    }

    if (filters.userLat !== undefined && filters.userLng !== undefined) {
      items = items.map((item) => {
        if (item.lat !== undefined && item.lng !== undefined) {
          const dist = calculateHaversineDistance(filters.userLat, filters.userLng, item.lat, item.lng);
          return {
            ...item,
            distanceMeters: Math.round(dist),
            distanceFormatted: formatDistance(dist),
            walkingTime: estimateWalkingTime(dist),
          };
        }
        return item;
      });
    }

    if (filters.sortBy === 'distance' && filters.userLat !== undefined && filters.userLng !== undefined) {
      items.sort((a, b) => (a.distanceMeters || Infinity) - (b.distanceMeters || Infinity));
    } else if (filters.sortBy === 'price-low') {
      items.sort((a, b) => a.rentalPrice - b.rentalPrice);
    } else if (filters.sortBy === 'price-high') {
      items.sort((a, b) => b.rentalPrice - a.rentalPrice);
    } else {
      items.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return items;
  },

  /**
   * Hyperlocal GPS Nearby Search
   * Connects to GET /api/equipment/nearby?lat=...&lon=...&radius=...
   */
  getNearbyItems: async (lat, lng, radiusMeters = 200, extraFilters = {}) => {
    try {
      const catId = extraFilters.category && extraFilters.category !== 'All' ? CATEGORY_MAP[extraFilters.category] : undefined;
      const res = await apiClient.get('/equipment/nearby', {
        params: {
          lat,
          lon: lng,
          radius: radiusMeters,
          category: catId,
        },
      });

      if (res && res.items) {
        isBackendOnline = true;
        let items = res.items.map(mapBackendEquipmentToItem);

        if (extraFilters.search) {
          const q = extraFilters.search.toLowerCase().trim();
          items = items.filter(
            (i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
          );
        }
        if (extraFilters.availableOnly) {
          items = items.filter((i) => i.available === true);
        }
        return items;
      }
    } catch {
      // Fallback to local storage calculation
    }

    await delay(60);
    return storageService.getNearbyItems(lat, lng, radiusMeters, extraFilters);
  },

  getItemById: async (id) => {
    try {
      const res = await apiClient.get(`/equipment/${id}`);
      if (res) {
        return mapBackendEquipmentToItem(res);
      }
    } catch {
      // Fallback
    }

    await delay(60);
    const item = storageService.getItemById(id);
    if (!item) {
      throw new Error(`Item with id ${id} not found.`);
    }
    return item;
  },

  createItem: async (itemData) => {
    try {
      const payload = mapItemToBackendEquipmentRequest(itemData);
      const res = await apiClient.post('/equipment', payload);
      if (res) {
        const mapped = mapBackendEquipmentToItem(res);
        // Also sync into local storage for offline consistency
        storageService.saveItem(mapped);
        return mapped;
      }
    } catch {
      // Fallback to local storage
    }

    await delay(80);
    return storageService.saveItem(itemData);
  },

  updateItem: async (id, updatedFields) => {
    try {
      const payload = mapItemToBackendEquipmentRequest(updatedFields);
      const res = await apiClient.put(`/equipment/${id}`, payload);
      if (res) {
        const mapped = mapBackendEquipmentToItem(res);
        storageService.updateItem(id, mapped);
        return mapped;
      }
    } catch {
      // Fallback
    }

    await delay(80);
    return storageService.updateItem(id, updatedFields);
  },

  deleteItem: async (id) => {
    try {
      await apiClient.delete(`/equipment/${id}`);
    } catch {
      // Fallback
    }
    await delay(60);
    return storageService.deleteItem(id);
  },

  getMyListings: async (ownerId) => {
    try {
      const res = await apiClient.get('/equipment/my');
      if (Array.isArray(res)) {
        return res.map(mapBackendEquipmentToItem);
      }
    } catch {
      // Fallback
    }
    await delay(60);
    return storageService.getItemsByOwner(ownerId);
  },

  // ---------------------------------------------------------------------------
  // 4. Rentals & Bookings Lifecycle APIs
  // ---------------------------------------------------------------------------
  getBookings: async (userId, role = 'renter') => {
    try {
      const roleParam = role.toLowerCase() === 'owner' ? 'OWNER' : 'RENTER';
      const res = await apiClient.get('/rentals/my', { params: { role: roleParam } });
      if (Array.isArray(res)) {
        return res.map(mapBackendRentalToBooking);
      }
    } catch {
      // Fallback
    }

    await delay(60);
    if (role === 'owner') {
      return storageService.getBookingsForOwner(userId);
    }
    return storageService.getBookingsByRenter(userId);
  },

  getRentalById: async (id) => {
    try {
      const res = await apiClient.get(`/rentals/${id}`);
      if (res) return mapBackendRentalToBooking(res);
    } catch {
      // Fallback
    }
    return storageService.getBookingById ? storageService.getBookingById(id) : null;
  },

  createBooking: async (bookingData) => {
    try {
      const payload = {
        equipmentId: bookingData.itemId,
        startAt: new Date(bookingData.startDate).toISOString(),
        endAt: new Date(bookingData.endDate).toISOString(),
      };
      const res = await apiClient.post('/rentals', payload);
      if (res) {
        const mapped = mapBackendRentalToBooking(res);
        storageService.saveBooking(mapped);
        return mapped;
      }
    } catch {
      // Fallback
    }

    await delay(80);
    return storageService.saveBooking(bookingData);
  },

  decideBooking: async (rentalId, decision, note = '') => {
    try {
      const res = await apiClient.patch(`/rentals/${rentalId}/decision`, { decision, note });
      if (res) return mapBackendRentalToBooking(res);
    } catch {
      // Fallback
    }
    const newStatus = decision === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
    return storageService.updateBookingStatus(rentalId, newStatus);
  },

  handoverBooking: async (rentalId) => {
    try {
      const res = await apiClient.patch(`/rentals/${rentalId}/handover`);
      if (res) return mapBackendRentalToBooking(res);
    } catch {
      // Fallback
    }
    return storageService.updateBookingStatus(rentalId, 'ACTIVE');
  },

  returnBooking: async (rentalId) => {
    try {
      const res = await apiClient.patch(`/rentals/${rentalId}/return`);
      if (res) return mapBackendRentalToBooking(res);
    } catch {
      // Fallback
    }
    return storageService.updateBookingStatus(rentalId, 'COMPLETED');
  },

  updateBookingStatus: async (id, status) => {
    // Route to appropriate backend lifecycle method
    if (status === 'ACCEPTED') {
      return apiService.decideBooking(id, 'ACCEPT');
    } else if (status === 'REJECTED') {
      return apiService.decideBooking(id, 'REJECT');
    } else if (status === 'ACTIVE') {
      return apiService.handoverBooking(id);
    } else if (status === 'COMPLETED') {
      return apiService.returnBooking(id);
    }

    // Default or CANCELLED
    return storageService.updateBookingStatus(id, status);
  },

  // ---------------------------------------------------------------------------
  // 5. Demo Payment Gateway APIs
  // ---------------------------------------------------------------------------
  createCheckoutSession: async (rentalId) => {
    try {
      return await apiClient.post('/payments/checkout', { rentalId });
    } catch (err) {
      // Simulated checkout session fallback
      return {
        orderId: `demo_ord_${Date.now()}_local`,
        rentalId,
        currency: 'INR',
        mode: 'DEMO',
        message: 'Demo checkout session initialized',
        demoTestCards: [
          { cardNumber: '4242 4242 4242 4242', expiry: '12/28', cvv: '123', expectedResult: 'Instant Success / Approved' },
          { cardNumber: '4000 0000 0000 0002', expiry: '12/28', cvv: '123', expectedResult: 'Simulated Card Declined' },
          { cardNumber: '5000 0000 0000 0003', expiry: '12/28', cvv: '123', expectedResult: 'Simulated Insufficient Funds' },
        ],
      };
    }
  },

  confirmDemoPayment: async (paymentData) => {
    try {
      return await apiClient.post('/payments/demo-confirm', paymentData);
    } catch (err) {
      // Simulated confirm fallback
      if (paymentData.simulateFailure || paymentData.cardNumber?.endsWith('0002')) {
        throw new Error('Card was declined (Demo simulation)');
      }
      return {
        paymentStatus: 'SUCCESS',
        rentalStatus: 'CONFIRMED',
        message: 'Demo payment approved! Rental is now CONFIRMED.',
        paidAt: new Date().toISOString(),
      };
    }
  },

  getPaymentStatus: async (rentalId) => {
    try {
      return await apiClient.get(`/payments/status/${rentalId}`);
    } catch {
      return { paymentStatus: 'SUCCESS', mode: 'DEMO' };
    }
  },

  // ---------------------------------------------------------------------------
  // 6. Reviews & Ratings APIs
  // ---------------------------------------------------------------------------
  createReview: async (reviewData) => {
    try {
      return await apiClient.post('/reviews', reviewData);
    } catch (err) {
      console.warn('Review submission error, falling back locally:', err.message);
      return { id: Date.now(), ...reviewData };
    }
  },

  getUserReviews: async (userId) => {
    try {
      return await apiClient.get(`/reviews/user/${userId}`);
    } catch {
      return [];
    }
  },

  // ---------------------------------------------------------------------------
  // 7. Users API
  // ---------------------------------------------------------------------------
  getUsers: async () => {
    await delay(40);
    return storageService.getUsers();
  },

  getUserById: async (id) => {
    try {
      const profile = await apiClient.get(`/users/${id}`);
      if (profile) return profile;
    } catch {
      // Fallback
    }
    await delay(40);
    return storageService.getUserById(id);
  },
};

export default apiService;
