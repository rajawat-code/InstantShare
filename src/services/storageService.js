/**
 * InstantShare - Local Storage Service
 * Handles persistence for items, bookings, users, and the active session user.
 * Initializes default mock data on initial load.
 */

import { mockUsers, mockItems, mockBookings } from '../data/mockData';

const KEYS = {
  USERS: 'instantshare_users',
  ITEMS: 'instantshare_items',
  BOOKINGS: 'instantshare_bookings',
  CURRENT_USER_ID: 'instantshare_current_user_id',
};

/**
 * Initialize storage with mock data if not already present.
 */
export const initStorage = () => {
  try {
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
      // Default to Aarav Sharma (id: 1)
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

  saveItem: (itemData) => {
    const items = storageService.getItems();
    const newItem = {
      ...itemData,
      id: Date.now(),
      rating: 5.0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...items];
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

  getItemsByOwner: (ownerId) => {
    const items = storageService.getItems();
    return items.filter((item) => item.ownerId === Number(ownerId));
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
    window.dispatchEvent(new Event('instantshare_data_changed'));
    window.dispatchEvent(new Event('instantshare_user_changed'));
    return true;
  },
};

export default storageService;

