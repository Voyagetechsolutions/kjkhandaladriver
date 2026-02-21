import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { SyncEngine } from '../services/syncEngine';
import { OfflineStorage } from '../services/offlineStorage';

interface SyncContextType {
  forceSyncNow: () => Promise<void>;
  getSyncStats: () => Promise<any>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Initialize sync engine on app start
    initializeSync();
  }, []);

  const initializeSync = async () => {
    try {
      await SyncEngine.initialize();
      console.log('Sync engine initialized');
      
      // Update unsynced count
      await SyncEngine.updateUnsyncedCount();
    } catch (error) {
      console.error('Failed to initialize sync engine:', error);
    }
  };

  const forceSyncNow = async () => {
    await SyncEngine.forceSyncNow();
  };

  const getSyncStats = async () => {
    return await OfflineStorage.getSyncStats();
  };

  return (
    <SyncContext.Provider value={{ forceSyncNow, getSyncStats }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};
