import React, { createContext, useContext, useState, useEffect } from 'react';
import storageService from '../services/storageService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState(() => storageService.getCurrentUser());
  const [users, setUsers] = useState(() => storageService.getUsers());
  const [dataVersion, setDataVersion] = useState(0);
  const [toast, setToast] = useState(null);

  // Sync with localStorage user changes or external changes
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

  const switchUser = (userId) => {
    const newUser = storageService.setCurrentUser(userId);
    if (newUser) {
      setCurrentUserState(newUser);
      showToast(`Switched active profile to ${newUser.name}`, 'info');
    }
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
        resetAllData,
        dataVersion,
        showToast,
        toast,
        closeToast,
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

