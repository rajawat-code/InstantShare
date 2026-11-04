/**
 * InstantShare - API Service Layer
 * Prepared for future Spring Boot REST API integration.
 * Currently backed by browser localStorage with async Promise wrappers.
 *
 * Future Spring Boot endpoints:
 *   GET    /api/items                - List all items
 *   GET    /api/items/nearby         - Get items within radius (lat, lng, radius)
 *   GET    /api/items/:id            - Get item by id
 *   POST   /api/items                - Create new item
 *   PUT    /api/items/:id            - Update item
 *   DELETE /api/items/:id            - Delete item
 *   GET    /api/bookings             - List bookings
 *   POST   /api/bookings             - Create booking
 *   PATCH  /api/bookings/:id/status  - Update booking status
 *   GET    /api/users                - List demo users
 *   GET    /api/users/:id            - Get user profile
 */

import axios from 'axios';
import storageService from './storageService';
import { calculateHaversineDistance, formatDistance, estimateWalkingTime } from '../utils/geo';

// Configure Axios client for when the Spring Boot backend is brought online
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Flag to toggle between localStorage mock mode and real REST backend
export const USE_REAL_BACKEND = false;

// Helper to simulate network latency for authentic UI feel
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiService = {
  // Items API
  getItems: async (filters = {}) => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.get('/items', { params: filters });
      return response.data;
    }
    await delay();
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

    // Attach distance calculation if user coordinates are passed in filters
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

    // Sorting
    if (filters.sortBy === 'distance' && filters.userLat !== undefined && filters.userLng !== undefined) {
      items.sort((a, b) => (a.distanceMeters || Infinity) - (b.distanceMeters || Infinity));
    } else if (filters.sortBy === 'price-low') {
      items.sort((a, b) => a.rentalPrice - b.rentalPrice);
    } else if (filters.sortBy === 'price-high') {
      items.sort((a, b) => b.rentalPrice - a.rentalPrice);
    } else {
      // Default: recently added (newest id or createdAt)
      items.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return items;
  },

  /**
   * Location-based query for items within a specific radius in meters
   * Sorted strictly from nearest to farthest.
   */
  getNearbyItems: async (lat, lng, radiusMeters = 200, extraFilters = {}) => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.get('/items/nearby', {
        params: { lat, lng, radius: radiusMeters, ...extraFilters },
      });
      return response.data;
    }
    await delay();
    return storageService.getNearbyItems(lat, lng, radiusMeters, extraFilters);
  },

  getItemById: async (id) => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.get(`/items/${id}`);
      return response.data;
    }
    await delay();
    const item = storageService.getItemById(id);
    if (!item) {
      throw new Error(`Item with id ${id} not found.`);
    }
    return item;
  },

  createItem: async (itemData) => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.post('/items', itemData);
      return response.data;
    }
    await delay();
    return storageService.saveItem(itemData);
  },

  updateItem: async (id, updatedFields) => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.put(`/items/${id}`, updatedFields);
      return response.data;
    }
    await delay();
    return storageService.updateItem(id, updatedFields);
  },

  deleteItem: async (id) => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.delete(`/items/${id}`);
      return response.data;
    }
    await delay();
    return storageService.deleteItem(id);
  },

  getMyListings: async (ownerId) => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.get(`/users/${ownerId}/items`);
      return response.data;
    }
    await delay();
    return storageService.getItemsByOwner(ownerId);
  },

  // Bookings API
  getBookings: async (userId, role = 'renter') => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.get('/bookings', { params: { userId, role } });
      return response.data;
    }
    await delay();
    if (role === 'owner') {
      return storageService.getBookingsForOwner(userId);
    }
    return storageService.getBookingsByRenter(userId);
  },

  createBooking: async (bookingData) => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.post('/bookings', bookingData);
      return response.data;
    }
    await delay();
    return storageService.saveBooking(bookingData);
  },

  updateBookingStatus: async (id, status) => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.patch(`/bookings/${id}/status`, { status });
      return response.data;
    }
    await delay();
    return storageService.updateBookingStatus(id, status);
  },

  // Users API
  getUsers: async () => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.get('/users');
      return response.data;
    }
    await delay();
    return storageService.getUsers();
  },

  getUserById: async (id) => {
    if (USE_REAL_BACKEND) {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    }
    await delay();
    return storageService.getUserById(id);
  },
};

export default apiService;
