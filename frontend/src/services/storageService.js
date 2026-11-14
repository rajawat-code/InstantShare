/**
 * InstantShare - Local Storage Service
 * Handles persistence for items, bookings, users, and the active session user.
 * Initializes default mock data on initial load.
 */

import { mockUsers, mockItems, mockBookings } from '../data/mockData';
import { calculateHaversineDistance, formatDistance, estimateWalkingTime } from '../utils/geo';

const KEYS = {
  USERS: 'instantshare_users',
  ITEMS: 'instantshare_items',
  BOOKINGS: 'instantshare_bookings',
  CURRENT_USER_ID: 'instantshare_current_user_id',
  DATA_SCHEMA_VERSION: 'instantshare_schema_v2', // bump to ensure geo-tagged mock items load
};

/**
 * Initialize storage with mock data if not already present or if upgraded.
 */
export const initStorage = () => {
  try {
    const schemaVersion = localStorage.getItem(KEYS.DATA_SCHEMA_VERSION);
    if (!schemaVersion || schemaVersion !== '2.0') {
      // Refresh items and users with geocoordinates
      localStorage.setItem(KEYS.USERS, JSON.stringify(mockUsers));
      localStorage.setItem(KEYS.ITEMS, JSON.stringify(mockItems));
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(mockBookings));
      localStorage.setItem(KEYS.CURRENT_USER_ID, JSON.stringify(1));
      localStorage.setItem(KEYS.DATA_SCHEMA_VERSION, '2.0');
      return;
    }

    if (!localStorage.getItem(KEYS.USERS)) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(mockUsers));
    }
    if (!localStorage.getItem(KEYS.ITEMS)) {
      localStorage.setItem(KEYS.ITEMS, JSON.stringify(mockItems));
    }
    if (!localStorage.getItem(KEYS.BOOKINGS)) {
      localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(mockBookings));
    }
    if (!localStorage.getItem(KEYS.CURRENT_USER_ID)) {
      localStorage.setItem(KEYS.CURRENT_USER_ID, JSON.stringify(1));
    }
  } catch (error) {
    console.error('Failed to initialize localStorage:', error);
  }
};

// Automatically run on module import
initStorage();

export const storageService = {
  // ================= USERS =================
  getUsers: () => {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : mockUsers;
    } catch {
      return mockUsers;
    }
  },

  getUserById: (id) => {
    const users = storageService.getUsers();
    return users.find((u) => u.id === Number(id)) || null;
  },

  getCurrentUserId: () => {
    try {
      const id = localStorage.getItem(KEYS.CURRENT_USER_ID);
      return id ? JSON.parse(id) : 1;
    } catch {
      return 1;
    }
  },

  getCurrentUser: () => {
    const id = storageService.getCurrentUserId();
    const user = storageService.getUserById(id);
    return user || mockUsers[0];
  },

  setCurrentUser: (userId) => {
    try {
      localStorage.setItem(KEYS.CURRENT_USER_ID, JSON.stringify(Number(userId)));
      window.dispatchEvent(new Event('instantshare_user_changed'));
      return storageService.getUserById(userId);
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  addUser: (userData) => {
    try {
      const users = storageService.getUsers();
      const newUser = {
        ...userData,
        id: userData.id || Date.now(),
        avatar:
          userData.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        location: userData.location || 'Local Neighborhood',
        memberSince: userData.memberSince || 'Just now',
        rating: userData.rating || 5.0,
        reviewsCount: userData.reviewsCount || 0,
      };
      const updated = [...users, newUser];
      localStorage.setItem(KEYS.USERS, JSON.stringify(updated));
      window.dispatchEvent(new Event('instantshare_user_changed'));
      return newUser;
    } catch (e) {
      console.error('Failed to add user to localStorage:', e);
      return userData;
    }
  },

  updateCurrentUser: (updateData) => {
    try {
      const current = storageService.getCurrentUser();
      const updatedUser = { ...current, ...updateData };
      const users = storageService.getUsers().map((u) => (u.id === current.id ? updatedUser : u));
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      window.dispatchEvent(new Event('instantshare_user_changed'));
      return updatedUser;
    } catch (e) {
      console.error('Failed to update current user in localStorage:', e);
      return updateData;
    }
  },

  // ================= ITEMS =================
  getItems: () => {
    try {
      const data = localStorage.getItem(KEYS.ITEMS);
      return data ? JSON.parse(data) : mockItems;
    } catch {
      return mockItems;
    }
  },

  getItemById: (id) => {
    const items = storageService.getItems();
    return items.find((item) => item.id === Number(id)) || null;
  },

  /**
   * Location-based nearby items query using the Haversine formula
   * @param {number} userLat
   * @param {number} userLng
   * @param {number} radiusMeters Default 200m
   * @param {Object} extraFilters
   * @returns {Array} Items within radius, sorted nearest to farthest
   */
  getNearbyItems: (userLat, userLng, radiusMeters = 200, extraFilters = {}) => {
    if (userLat === undefined || userLng === undefined) {
      return [];
    }

    const items = storageService.getItems();
    const results = [];

    for (const item of items) {
      if (item.lat === undefined || item.lng === undefined) continue;

      const dist = calculateHaversineDistance(userLat, userLng, item.lat, item.lng);

      if (dist <= radiusMeters) {
        // Apply extra filters if provided
        if (extraFilters.category && extraFilters.category !== 'All') {
          if (item.category.toLowerCase() !== extraFilters.category.toLowerCase()) continue;
        }
        if (extraFilters.availableOnly && !item.available) continue;
        if (extraFilters.search) {
          const q = extraFilters.search.toLowerCase().trim();
          const matches =
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q);
          if (!matches) continue;
        }

        results.push({
          ...item,
          distanceMeters: Math.round(dist),
          distanceFormatted: formatDistance(dist),
          walkingTime: estimateWalkingTime(dist),
        });
      }
    }

    // Sort strictly from nearest to farthest
    results.sort((a, b) => a.distanceMeters - b.distanceMeters);
    return results;
  },

  saveItem: (itemData) => {
    const items = storageService.getItems();
    const newItem = {
      ...itemData,
      id: itemData.id || Date.now(),
      ownerId: itemData.ownerId,
      ownerName: itemData.ownerName || 'Verified Neighbor',
      ownerEmail: itemData.ownerEmail || undefined,
      rating: itemData.rating || 5.0,
      reviewsCount: itemData.reviewsCount || 0,
      createdAt: itemData.createdAt || new Date().toISOString(),
    };
    const existingIdx = items.findIndex((i) => i.id === newItem.id);
    let updated;
    if (existingIdx >= 0) {
      updated = [...items];
      updated[existingIdx] = { ...updated[existingIdx], ...newItem };
    } else {
      updated = [newItem, ...items];
    }
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(updated));
    window.dispatchEvent(new Event('instantshare_data_changed'));
    return newItem;
  },

  updateItem: (id, updatedFields) => {
    const items = storageService.getItems();
    let updatedItem = null;
    const updated = items.map((item) => {
      if (item.id === Number(id)) {
        updatedItem = { ...item, ...updatedFields, updatedAt: new Date().toISOString() };
        return updatedItem;
      }
      return item;
    });
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(updated));
    window.dispatchEvent(new Event('instantshare_data_changed'));
    return updatedItem;
  },

  deleteItem: (id) => {
    const items = storageService.getItems();
    const updated = items.filter((item) => item.id !== Number(id));
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(updated));
    window.dispatchEvent(new Event('instantshare_data_changed'));
    return true;
  },

  getItemsByOwner: (ownerId, userEmail) => {
    const items = storageService.getItems();
    const targetIdStr = ownerId !== undefined && ownerId !== null ? String(ownerId) : null;
    const targetEmail = userEmail ? String(userEmail).toLowerCase().trim() : null;

    return items.filter((item) => {
      if (!item) return false;
      const itemOwnerIdStr =
        item.ownerId !== undefined && item.ownerId !== null ? String(item.ownerId) : null;
      const matchesId = targetIdStr && itemOwnerIdStr === targetIdStr;
      const matchesNum =
        ownerId !== undefined && ownerId !== null && Number(item.ownerId) === Number(ownerId);
      const matchesEmail =
        targetEmail &&
        item.ownerEmail &&
        String(item.ownerEmail).toLowerCase().trim() === targetEmail;

      return Boolean(matchesId || matchesNum || matchesEmail);
    });
  },

  // ================= BOOKINGS =================
  getBookings: () => {
    try {
      const data = localStorage.getItem(KEYS.BOOKINGS);
      return data ? JSON.parse(data) : mockBookings;
    } catch {
      return mockBookings;
    }
  },

  getBookingById: (id) => {
    const bookings = storageService.getBookings();
    return bookings.find((b) => b.id === Number(id)) || null;
  },

  getBookingsByRenter: (renterId) => {
    const bookings = storageService.getBookings();
    return bookings.filter((b) => b.renterId === Number(renterId));
  },

  getBookingsForOwner: (ownerId) => {
    const bookings = storageService.getBookings();
    return bookings.filter((b) => b.ownerId === Number(ownerId));
  },

  saveBooking: (bookingData) => {
    const bookings = storageService.getBookings();
    const newBooking = {
      ...bookingData,
      id: Date.now(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    const updated = [newBooking, ...bookings];
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event('instantshare_data_changed'));
    return newBooking;
  },

  updateBookingStatus: (id, newStatus) => {
    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'ACTIVE', 'COMPLETED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid booking status: ${newStatus}`);
    }

    const bookings = storageService.getBookings();
    let updatedBooking = null;
    const updated = bookings.map((b) => {
      if (b.id === Number(id)) {
        updatedBooking = {
          ...b,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
        return updatedBooking;
      }
      return b;
    });

    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(updated));
    window.dispatchEvent(new Event('instantshare_data_changed'));
    return updatedBooking;
  },

  // ================= UTILITIES =================
  resetToMockData: () => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(mockUsers));
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(mockItems));
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(mockBookings));
    localStorage.setItem(KEYS.CURRENT_USER_ID, JSON.stringify(1));
    localStorage.setItem(KEYS.DATA_SCHEMA_VERSION, '2.0');
    window.dispatchEvent(new Event('instantshare_data_changed'));
    window.dispatchEvent(new Event('instantshare_user_changed'));
    return true;
  },
};

export default storageService;
