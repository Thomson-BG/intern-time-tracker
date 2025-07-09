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
  const res = await fetch(TIME_TRACKER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    throw new Error(`Time-tracker API error: ${res.status} ${res.statusText}`);
  }
  return res.text();
}
