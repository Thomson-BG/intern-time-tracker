// src/utils/timeTrackerApi.ts

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
      // For now, we'll throw a more helpful error message
      // In the future, this could implement offline storage or retry logic
      throw new Error('Network connectivity issue detected. Please check your internet connection and try again. If the problem persists, contact your system administrator.');
    }
    throw error;
  }
}
