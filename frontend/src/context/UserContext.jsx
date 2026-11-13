import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import storageService from '../services/storageService';
import apiService from '../services/apiService';

const UserContext = createContext();

// Map demo users to Spring Boot test accounts from seed_data.sql
const DEMO_ACCOUNT_CREDENTIALS = {
  1: { email: 'owner1@instantshare.test', password: 'password123' },
  2: { email: 'owner2@instantshare.test', password: 'password123' },
  3: { email: 'renter@instantshare.test', password: 'password123' },
  4: { email: 'business@instantshare.test', password: 'password123' },
  5: { email: 'owner1@instantshare.test', password: 'password123' },
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState(() => storageService.getCurrentUser());
  const [users, setUsers] = useState(() => storageService.getUsers());
  const [dataVersion, setDataVersion] = useState(0);
  const [toast, setToast] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);
  const [apiBaseUrl, setApiBaseUrlState] = useState(() => apiService.getBaseUrl());

  // Probe Spring Boot backend on mount
  const checkBackend = useCallback(async () => {
    setIsCheckingBackend(true);
    const online = await apiService.checkBackendHealth();
    setIsBackendOnline(online);
    setIsCheckingBackend(false);
    return online;
  }, []);

  const updateApiBaseUrl = async (newUrl) => {
    apiService.setBaseUrl(newUrl);
    setApiBaseUrlState(apiService.getBaseUrl());
    const online = await checkBackend();
    if (online) {
      showToast(`Connected to backend at ${apiService.getBaseUrl()}`, 'success');
    } else {
      showToast(`Backend at ${apiService.getBaseUrl()} unreachable. Fallback active.`, 'info');
    }
    setDataVersion((v) => v + 1);
  };

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  // Sync with localStorage user changes or external events
  useEffect(() => {
    const handleUserChange = () => {
      setCurrentUserState(storageService.getCurrentUser());
      setUsers(storageService.getUsers());
      setDataVersion((v) => v + 1);
    };

    const handleDataChange = () => {
      setDataVersion((v) => v + 1);
    };

    window.addEventListener('instantshare_user_changed', handleUserChange);
    window.addEventListener('instantshare_data_changed', handleDataChange);

    return () => {
      window.removeEventListener('instantshare_user_changed', handleUserChange);
      window.removeEventListener('instantshare_data_changed', handleDataChange);
    };
  }, []);

  // Switch demo user & optionally authenticate with Spring Boot
  const switchUser = async (userId) => {
    const newUser = storageService.setCurrentUser(userId);
    if (newUser) {
      setCurrentUserState(newUser);
      showToast(`Switched active profile to ${newUser.name}`, 'info');

      // Attempt to obtain backend JWT token if backend is online
      const creds = DEMO_ACCOUNT_CREDENTIALS[userId];
      if (creds) {
        try {
          const authRes = await apiService.login(creds.email, creds.password);
          if (authRes && authRes.token) {
            console.log(`[InstantShare Auth] Authenticated as ${creds.email} on Spring Boot backend.`);
          }
        } catch {
          // Gracefully continue in local mode
        }
      }
    }
  };

  const login = async (email, password) => {
    const authData = await apiService.login(email, password);
    if (authData) {
      showToast(`Logged in successfully as ${authData.name || email}`, 'success');
      setDataVersion((v) => v + 1);
      return authData;
    }
  };

  const register = async (userData) => {
    const authData = await apiService.register(userData);
    if (authData) {
      showToast(`Registered successfully as ${userData.name}`, 'success');
      setDataVersion((v) => v + 1);
      return authData;
    }
  };

  const logout = () => {
    apiService.logout();
    showToast('Logged out of session', 'info');
    setDataVersion((v) => v + 1);
  };

  const resetAllData = () => {
    storageService.resetToMockData();
    setCurrentUserState(storageService.getCurrentUser());
    setUsers(storageService.getUsers());
    setDataVersion((v) => v + 1);
    showToast('Platform reset to default demo data successfully', 'success');
  };

  const showToast = (message, type = 'success', duration = 3500) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((current) => (current && current.message === message ? null : current));
    }, duration);
  };

  const closeToast = () => setToast(null);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        login,
        register,
        logout,
        resetAllData,
        dataVersion,
        showToast,
        toast,
        closeToast,
        isBackendOnline,
        isCheckingBackend,
        recheckBackend: checkBackend,
        apiBaseUrl,
        updateApiBaseUrl,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
