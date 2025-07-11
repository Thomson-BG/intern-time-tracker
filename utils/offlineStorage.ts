export interface OfflineEntry {
  id: string;
  data: any;
  timestamp: number;
  type: 'timelog' | 'absencelog';
}

const OFFLINE_STORAGE_KEY = 'time_tracker_offline_entries';

export class OfflineStorage {
  static saveEntry(entry: any, type: 'timelog' | 'absencelog'): string {
    const offlineEntry: OfflineEntry = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data: entry,
      timestamp: Date.now(),
      type
    };

    const existingEntries = this.getOfflineEntries();
    existingEntries.push(offlineEntry);
    
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(existingEntries));
    return offlineEntry.id;
  }

  static getOfflineEntries(): OfflineEntry[] {
    try {
      const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading offline entries:', error);
      return [];
    }
  }

  static removeEntry(id: string): void {
    const entries = this.getOfflineEntries().filter(entry => entry.id !== id);
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(entries));
  }

  static clearAllEntries(): void {
    localStorage.removeItem(OFFLINE_STORAGE_KEY);
  }

  static getEntryCount(): number {
    return this.getOfflineEntries().length;
  }
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function addOnlineListener(callback: () => void): () => void {
  const handleOnline = () => callback();
  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}

export function addOfflineListener(callback: () => void): () => void {
  const handleOffline = () => callback();
  window.addEventListener('offline', handleOffline);
  return () => window.removeEventListener('offline', handleOffline);
}