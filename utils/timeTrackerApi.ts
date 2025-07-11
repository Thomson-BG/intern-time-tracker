// src/utils/timeTrackerApi.ts

import { OfflineStorage } from './offlineStorage';

// Pull in the exec URL from your .env (VITE_TIME_TRACKER_API)
const TIME_TRACKER_API = import.meta.env.VITE_TIME_TRACKER_API as string;

export interface TimeLog {
  type: 'timelog' | 'absencelog';
  firstName: string;
  lastName: string;
  employeeId: string;
  deviceName?: string;
  action?: string;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  deviceId?: string;
  userAgent?: string;
  duration?: number;
}

export async function logTime(entry: TimeLog): Promise<string> {
  if (!TIME_TRACKER_API) {
    throw new Error('TIME_TRACKER_API is not configured. Please check your environment variables.');
  }

  // Check if we're online
  if (!navigator.onLine) {
    // Store offline and return success message
    const offlineId = OfflineStorage.saveEntry(entry, entry.type);
    console.log('Device is offline. Entry saved locally with ID:', offlineId);
    return 'Entry saved offline. Will sync when connection is restored.';
  }

  try {
    const res = await fetch(TIME_TRACKER_API, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/plain, application/json'
      },
      body: JSON.stringify(entry),
      mode: 'cors', // Explicitly enable CORS
      credentials: 'omit' // Don't send credentials
    });
    
    if (!res.ok) {
      let errorMessage = `API error: ${res.status} ${res.statusText}`;
      try {
        const errorText = await res.text();
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      } catch (e) {
        // Ignore errors reading response body
      }
      throw new Error(errorMessage);
    }
    
    return res.text();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      // Save to offline storage as fallback
      const offlineId = OfflineStorage.saveEntry(entry, entry.type);
      console.log('Network error occurred. Entry saved locally with ID:', offlineId);
      throw new Error('Network connectivity issue detected. Your entry has been saved locally and will be synchronized when connection is restored.');
    }
    throw error;
  }
}

// Function to sync offline entries when back online
export async function syncOfflineEntries(): Promise<{ synced: number; failed: number }> {
  const offlineEntries = OfflineStorage.getOfflineEntries();
  let synced = 0;
  let failed = 0;

  for (const offlineEntry of offlineEntries) {
    try {
      await logTime(offlineEntry.data);
      OfflineStorage.removeEntry(offlineEntry.id);
      synced++;
    } catch (error) {
      console.error('Failed to sync offline entry:', offlineEntry.id, error);
      failed++;
    }
  }

  return { synced, failed };
}
