// Sync engine with conflict detection and resolution
import NetInfo from '@react-native-community/netinfo';
import { OfflineStorage, SyncQueueItem } from './offlineStorage';
import { ApiService } from './api';

export interface SyncStatus {
  isSyncing: boolean;
  isOnline: boolean;
  progress: number;
  currentItem: string | null;
  errors: string[];
  lastSync: string | null;
  totalUnsynced: number;
}

export interface ConflictResolution {
  itemId: string;
  strategy: 'server-wins' | 'client-wins' | 'merge' | 'manual';
  serverData?: any;
  clientData?: any;
  resolvedData?: any;
}

export class SyncEngine {
  private static isSyncing = false;
  private static syncListeners: Array<(status: SyncStatus) => void> = [];
  private static currentStatus: SyncStatus = {
    isSyncing: false,
    isOnline: false,
    progress: 0,
    currentItem: null,
    errors: [],
    lastSync: null,
    totalUnsynced: 0,
  };

  // Initialize sync engine
  static async initialize(): Promise<void> {
    // Listen for network changes
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.currentStatus.isOnline;
      this.currentStatus.isOnline = state.isConnected ?? false;
      
      // Auto-sync when coming back online
      if (wasOffline && this.currentStatus.isOnline) {
        console.log('Network restored - starting auto-sync');
        this.startSync();
      }
      
      this.notifyListeners();
    });

    // Check initial network status
    const netInfo = await NetInfo.fetch();
    this.currentStatus.isOnline = netInfo.isConnected ?? false;
    
    // Load last sync time
    this.currentStatus.lastSync = await OfflineStorage.getLastSyncTime();
    
    // Get unsynced count
    const stats = await OfflineStorage.getSyncStats();
    this.currentStatus.totalUnsynced = stats.totalUnsynced;
    
    this.notifyListeners();
  }

  // Subscribe to sync status updates
  static subscribe(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(): void {
    this.syncListeners.forEach((listener) => listener(this.currentStatus));
  }

  // Start sync process
  static async startSync(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!this.currentStatus.isOnline) {
      console.log('Cannot sync - offline');
      return;
    }

    this.isSyncing = true;
    this.currentStatus.isSyncing = true;
    this.currentStatus.errors = [];
    this.currentStatus.progress = 0;
    this.notifyListeners();

    try {
      const queue = await OfflineStorage.getUnsyncedQueue();
      
      if (queue.length === 0) {
        console.log('Nothing to sync');
        this.completeSyncSuccess();
        return;
      }

      console.log(`Starting sync of ${queue.length} items`);
      
      // Sort queue by timestamp (oldest first)
      queue.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      // Sync items one by one
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        this.currentStatus.currentItem = `${item.type} (${item.action})`;
        this.currentStatus.progress = ((i + 1) / queue.length) * 100;
        this.notifyListeners();

        try {
          await this.syncItem(item);
          
          // Mark as synced
          await OfflineStorage.updateSyncQueueItem(item.id, {
            synced: true,
            lastSyncAttempt: new Date().toISOString(),
          });
          
          // Update original data as synced
          await this.markDataAsSynced(item);
          
        } catch (error: any) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Update sync attempts
          await OfflineStorage.updateSyncQueueItem(item.id, {
            syncAttempts: item.syncAttempts + 1,
            lastSyncAttempt: new Date().toISOString(),
            error: error.message,
          });
          
          this.currentStatus.errors.push(
            `Failed to sync ${item.type}: ${error.message}`
          );
          
          // Don't stop sync for individual failures
          continue;
        }
      }

      // Clean up synced items
      await OfflineStorage.clearSyncedItems();
      
      this.completeSyncSuccess();
      
    } catch (error: any) {
      console.error('Sync failed:', error);
      this.currentStatus.errors.push(`Sync failed: ${error.message}`);
      this.completeSyncFailure();
    }
  }

  private static async syncItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'inspection':
        await this.syncInspection(item);
        break;
      case 'fuel_log':
        await this.syncFuelLog(item);
        break;
      case 'breakdown':
        await this.syncBreakdown(item);
        break;
      case 'checkin':
        await this.syncCheckin(item);
        break;
      case 'shift':
        await this.syncShift(item);
        break;
      case 'trip':
        await this.syncTrip(item);
        break;
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
  }

  private static async syncInspection(item: SyncQueueItem): Promise<void> {
    // In production, call real API
    // await ApiService.createInspection(item.data);
    
    // Simulate API call
    await this.simulateApiCall();
    console.log('Synced inspection:', item.data.id);
  }

  private static async syncFuelLog(item: SyncQueueItem): Promise<void> {
    // await ApiService.createFuelLog(item.data);
    await this.simulateApiCall();
    console.log('Synced fuel log:', item.data.id);
  }

  private static async syncBreakdown(item: SyncQueueItem): Promise<void> {
    // await ApiService.createBreakdown(item.data);
    await this.simulateApiCall();
    console.log('Synced breakdown:', item.data.id);
  }

  private static async syncCheckin(item: SyncQueueItem): Promise<void> {
    // Check for conflicts - passenger might be checked in from another device
    const conflict = await this.detectCheckinConflict(item.data);
    
    if (conflict) {
      // Resolve conflict (server wins for check-ins)
      console.log('Conflict detected for check-in, server wins');
      return;
    }
    
    // await ApiService.checkinPassenger(item.data.id, item.data);
    await this.simulateApiCall();
    console.log('Synced check-in:', item.data.id);
  }

  private static async syncShift(item: SyncQueueItem): Promise<void> {
    if (item.action === 'update') {
      // await ApiService.updateShift(item.data.id, item.data);
      await this.simulateApiCall();
      console.log('Synced shift update:', item.data.id);
    }
  }

  private static async syncTrip(item: SyncQueueItem): Promise<void> {
    if (item.action === 'update') {
      // Check for conflicts - trip might be updated from dispatch
      const conflict = await this.detectTripConflict(item.data);
      
      if (conflict) {
        // Merge strategy for trips
        const resolved = await this.resolveTripConflict(conflict);
        // await ApiService.updateTrip(item.data.id, resolved);
      } else {
        // await ApiService.updateTrip(item.data.id, item.data);
      }
      
      await this.simulateApiCall();
      console.log('Synced trip update:', item.data.id);
    }
  }

  // Conflict detection
  private static async detectCheckinConflict(data: any): Promise<boolean> {
    // In production, fetch from server and compare timestamps
    // const serverData = await ApiService.getPassenger(data.id);
    // return serverData.boarded && serverData.boardedTime !== data.boardedTime;
    return false;
  }

  private static async detectTripConflict(data: any): Promise<ConflictResolution | null> {
    // In production, fetch from server and compare
    // const serverData = await ApiService.getTrip(data.id);
    // if (serverData.updatedAt > data.updatedAt) {
    //   return {
    //     itemId: data.id,
    //     strategy: 'merge',
    //     serverData,
    //     clientData: data,
    //   };
    // }
    return null;
  }

  private static async resolveTripConflict(
    conflict: ConflictResolution
  ): Promise<any> {
    // Merge strategy: keep driver updates, merge with server changes
    const { serverData, clientData } = conflict;
    
    return {
      ...serverData,
      // Keep driver-specific updates
      status: clientData.status,
      passengers: clientData.passengers,
      // Merge other fields
    };
  }

  private static async markDataAsSynced(item: SyncQueueItem): Promise<void> {
    // Mark the original data as synced
    switch (item.type) {
      case 'inspection':
        // Update inspection synced flag
        break;
      case 'fuel_log':
        // Update fuel log synced flag
        break;
      case 'breakdown':
        // Update breakdown synced flag
        break;
      // ... other types
    }
  }

  private static completeSyncSuccess(): void {
    this.isSyncing = false;
    this.currentStatus.isSyncing = false;
    this.currentStatus.progress = 100;
    this.currentStatus.currentItem = null;
    this.currentStatus.lastSync = new Date().toISOString();
    this.currentStatus.totalUnsynced = 0;
    
    OfflineStorage.setLastSyncTime(this.currentStatus.lastSync);
    this.notifyListeners();
    
    console.log('Sync completed successfully');
  }

  private static completeSyncFailure(): void {
    this.isSyncing = false;
    this.currentStatus.isSyncing = false;
    this.currentStatus.currentItem = null;
    this.notifyListeners();
    
    console.log('Sync completed with errors');
  }

  // Manual sync trigger
  static async forceSyncNow(): Promise<void> {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      throw new Error('No internet connection');
    }
    
    await this.startSync();
  }

  // Get current sync status
  static getStatus(): SyncStatus {
    return { ...this.currentStatus };
  }

  // Update unsynced count
  static async updateUnsyncedCount(): Promise<void> {
    const stats = await OfflineStorage.getSyncStats();
    this.currentStatus.totalUnsynced = stats.totalUnsynced;
    this.notifyListeners();
  }

  // Simulate API call (for development)
  private static async simulateApiCall(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }
}
