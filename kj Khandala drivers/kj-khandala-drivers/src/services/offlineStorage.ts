// Offline storage service using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PreTripInspection,
  FuelLog,
  BreakdownReport,
  Passenger,
  Shift,
  Trip,
} from '../types';

// Storage keys
const STORAGE_KEYS = {
  INSPECTIONS: '@offline_inspections',
  FUEL_LOGS: '@offline_fuel_logs',
  BREAKDOWNS: '@offline_breakdowns',
  CHECKINS: '@offline_checkins',
  SHIFTS: '@offline_shifts',
  TRIPS: '@offline_trips',
  SYNC_QUEUE: '@sync_queue',
  LAST_SYNC: '@last_sync_time',
};

export interface SyncQueueItem {
  id: string;
  type: 'inspection' | 'fuel_log' | 'breakdown' | 'checkin' | 'shift' | 'trip';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  synced: boolean;
  syncAttempts: number;
  lastSyncAttempt?: string;
  error?: string;
}

export class OfflineStorage {
  // Generic storage methods
  private static async getItem<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return [];
    }
  }

  private static async setItem<T>(key: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  }

  private static async addItem<T extends { id: string }>(
    key: string,
    item: T
  ): Promise<void> {
    const items = await this.getItem<T>(key);
    items.push(item);
    await this.setItem(key, items);
  }

  private static async updateItem<T extends { id: string }>(
    key: string,
    id: string,
    updates: Partial<T>
  ): Promise<void> {
    const items = await this.getItem<T>(key);
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      await this.setItem(key, items);
    }
  }

  private static async deleteItem(key: string, id: string): Promise<void> {
    const items = await this.getItem<any>(key);
    const filtered = items.filter((item) => item.id !== id);
    await this.setItem(key, filtered);
  }

  // Inspections
  static async saveInspection(inspection: PreTripInspection): Promise<void> {
    await this.addItem(STORAGE_KEYS.INSPECTIONS, inspection);
    await this.addToSyncQueue({
      id: `sync-${Date.now()}-${Math.random()}`,
      type: 'inspection',
      action: 'create',
      data: inspection,
      timestamp: new Date().toISOString(),
      synced: false,
      syncAttempts: 0,
    });
  }

  static async getInspections(): Promise<PreTripInspection[]> {
    return this.getItem<PreTripInspection>(STORAGE_KEYS.INSPECTIONS);
  }

  static async getUnsyncedInspections(): Promise<PreTripInspection[]> {
    const inspections = await this.getInspections();
    return inspections.filter((i) => !i.synced);
  }

  // Fuel Logs
  static async saveFuelLog(fuelLog: FuelLog): Promise<void> {
    await this.addItem(STORAGE_KEYS.FUEL_LOGS, fuelLog);
    await this.addToSyncQueue({
      id: `sync-${Date.now()}-${Math.random()}`,
      type: 'fuel_log',
      action: 'create',
      data: fuelLog,
      timestamp: new Date().toISOString(),
      synced: false,
      syncAttempts: 0,
    });
  }

  static async getFuelLogs(): Promise<FuelLog[]> {
    return this.getItem<FuelLog>(STORAGE_KEYS.FUEL_LOGS);
  }

  static async getUnsyncedFuelLogs(): Promise<FuelLog[]> {
    const logs = await this.getFuelLogs();
    return logs.filter((l) => !l.synced);
  }

  // Breakdowns
  static async saveBreakdown(breakdown: BreakdownReport): Promise<void> {
    await this.addItem(STORAGE_KEYS.BREAKDOWNS, breakdown);
    await this.addToSyncQueue({
      id: `sync-${Date.now()}-${Math.random()}`,
      type: 'breakdown',
      action: 'create',
      data: breakdown,
      timestamp: new Date().toISOString(),
      synced: false,
      syncAttempts: 0,
    });
  }

  static async getBreakdowns(): Promise<BreakdownReport[]> {
    return this.getItem<BreakdownReport>(STORAGE_KEYS.BREAKDOWNS);
  }

  static async getUnsyncedBreakdowns(): Promise<BreakdownReport[]> {
    const breakdowns = await this.getBreakdowns();
    return breakdowns.filter((b) => !b.synced);
  }

  // Check-ins
  static async saveCheckin(passenger: Passenger): Promise<void> {
    await this.addItem(STORAGE_KEYS.CHECKINS, passenger);
    await this.addToSyncQueue({
      id: `sync-${Date.now()}-${Math.random()}`,
      type: 'checkin',
      action: 'create',
      data: passenger,
      timestamp: new Date().toISOString(),
      synced: false,
      syncAttempts: 0,
    });
  }

  static async getCheckins(): Promise<Passenger[]> {
    return this.getItem<Passenger>(STORAGE_KEYS.CHECKINS);
  }

  static async getUnsyncedCheckins(): Promise<Passenger[]> {
    const checkins = await this.getCheckins();
    return checkins.filter((c) => c.boarded && !c.boardedTime);
  }

  // Shifts
  static async saveShift(shift: Shift): Promise<void> {
    await this.addItem(STORAGE_KEYS.SHIFTS, shift);
  }

  static async getShifts(): Promise<Shift[]> {
    return this.getItem<Shift>(STORAGE_KEYS.SHIFTS);
  }

  static async updateShift(id: string, updates: Partial<Shift>): Promise<void> {
    await this.updateItem<Shift>(STORAGE_KEYS.SHIFTS, id, updates);
    await this.addToSyncQueue({
      id: `sync-${Date.now()}-${Math.random()}`,
      type: 'shift',
      action: 'update',
      data: { id, ...updates },
      timestamp: new Date().toISOString(),
      synced: false,
      syncAttempts: 0,
    });
  }

  // Trips
  static async saveTrip(trip: Trip): Promise<void> {
    await this.addItem(STORAGE_KEYS.TRIPS, trip);
  }

  static async getTrips(): Promise<Trip[]> {
    return this.getItem<Trip>(STORAGE_KEYS.TRIPS);
  }

  static async updateTrip(id: string, updates: Partial<Trip>): Promise<void> {
    await this.updateItem<Trip>(STORAGE_KEYS.TRIPS, id, updates);
    await this.addToSyncQueue({
      id: `sync-${Date.now()}-${Math.random()}`,
      type: 'trip',
      action: 'update',
      data: { id, ...updates },
      timestamp: new Date().toISOString(),
      synced: false,
      syncAttempts: 0,
    });
  }

  // Sync Queue Management
  static async addToSyncQueue(item: SyncQueueItem): Promise<void> {
    const queue = await this.getSyncQueue();
    queue.push(item);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
  }

  static async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  static async getUnsyncedQueue(): Promise<SyncQueueItem[]> {
    const queue = await this.getSyncQueue();
    return queue.filter((item) => !item.synced);
  }

  static async updateSyncQueueItem(
    id: string,
    updates: Partial<SyncQueueItem>
  ): Promise<void> {
    const queue = await this.getSyncQueue();
    const index = queue.findIndex((item) => item.id === id);
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(queue));
    }
  }

  static async removeSyncQueueItem(id: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(filtered));
  }

  static async clearSyncedItems(): Promise<void> {
    const queue = await this.getSyncQueue();
    const unsynced = queue.filter((item) => !item.synced);
    await AsyncStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(unsynced));
  }

  // Last sync time
  static async setLastSyncTime(time: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, time);
  }

  static async getLastSyncTime(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  }

  // Clear all offline data (use with caution)
  static async clearAllOfflineData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.INSPECTIONS,
      STORAGE_KEYS.FUEL_LOGS,
      STORAGE_KEYS.BREAKDOWNS,
      STORAGE_KEYS.CHECKINS,
      STORAGE_KEYS.SHIFTS,
      STORAGE_KEYS.TRIPS,
      STORAGE_KEYS.SYNC_QUEUE,
    ]);
  }

  // Get sync statistics
  static async getSyncStats(): Promise<{
    totalUnsynced: number;
    inspections: number;
    fuelLogs: number;
    breakdowns: number;
    checkins: number;
    shifts: number;
    trips: number;
    lastSync: string | null;
  }> {
    const queue = await this.getUnsyncedQueue();
    
    return {
      totalUnsynced: queue.length,
      inspections: queue.filter((i) => i.type === 'inspection').length,
      fuelLogs: queue.filter((i) => i.type === 'fuel_log').length,
      breakdowns: queue.filter((i) => i.type === 'breakdown').length,
      checkins: queue.filter((i) => i.type === 'checkin').length,
      shifts: queue.filter((i) => i.type === 'shift').length,
      trips: queue.filter((i) => i.type === 'trip').length,
      lastSync: await this.getLastSyncTime(),
    };
  }
}
