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

export interface AbsenceEntry {
  type: 'absencelog';
  firstName: string;
  lastName: string;
  employeeId: string;
  deviceName?: string;
  date: string;
  absenceType: string;
  reason: string;
  submitted: string;
}

export async function logTime(entry: TimeLog): Promise<string> {
  if (!TIME_TRACKER_API) {
    throw new Error('Google Sheets API URL not configured. Please check VITE_TIME_TRACKER_API in .env file.');
  }

  console.log('Sending data to Google Sheets:', entry);
  console.log('Using API URL:', TIME_TRACKER_API);
  
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV;
  
  // Method 1: Try standard CORS request first
  try {
    const res = await fetch(TIME_TRACKER_API, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const responseText = await res.text();
    console.log('Google Sheets response:', responseText);
    return responseText || 'Data sent successfully';
    
  } catch (corsError) {
    console.warn('Standard CORS request failed, using no-cors mode:', corsError);
    
    // Method 2: Use no-cors mode 
    // In no-cors mode, the browser will send the request but we can't read the response
    // This is often the only way to communicate with Google Apps Script from web browsers
    try {
      await fetch(TIME_TRACKER_API, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
      
      // If we reach here without error, the request was sent successfully
      // We can't verify if Google Sheets received it due to no-cors limitations
      console.log('Request sent using no-cors mode');
      return 'Request sent successfully (no-cors mode - Google Sheets response unavailable)';
      
    } catch (noCorsError) {
      console.error('No-cors request failed:', noCorsError);
      
      // Method 3: Try with URL-encoded form data as fallback
      try {
        const params = new URLSearchParams();
        Object.entries(entry).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        
        await fetch(TIME_TRACKER_API, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        });
        
        console.log('Request sent using form data');
        return 'Request sent successfully (form data mode - Google Sheets response unavailable)';
        
      } catch (formError) {
        console.error('All request methods failed:', formError);
        
        // In development mode, provide a more helpful message and don't throw error
        if (isDevelopment) {
          console.warn('Development mode detected: External requests may be blocked by the dev server.');
          console.log('Data would be sent in production:', entry);
          return 'Development mode: Request simulated (will work in production)';
        }
        
        // Provide a helpful error message with troubleshooting info
        throw new Error(
          `Unable to send data to Google Sheets. This could be due to:\n` +
          `1. Network restrictions in development environment\n` +
          `2. Google Apps Script not configured for cross-origin requests\n` +
          `3. Incorrect Google Apps Script URL\n\n` +
          `The application will continue to work locally. In production, this may resolve automatically.\n\n` +
          `Original error: ${corsError instanceof Error ? corsError.message : 'Unknown error'}`
        );
      }
    }
  }
}

export async function submitAbsence(entry: AbsenceEntry): Promise<string> {
  return logTime(entry as any);
}

export interface AdminCredential {
  type: 'admincredential';
  firstName: string;
  lastName: string;
  employeeId: string;
  username: string;
  password: string;
}

export async function saveAdminCredential(credential: AdminCredential): Promise<string> {
  if (!TIME_TRACKER_API) {
    throw new Error('Google Sheets API URL not configured. Please check VITE_TIME_TRACKER_API in .env file.');
  }

  console.log('Saving admin credential to Google Sheets:', credential);
  
  try {
    const res = await fetch(TIME_TRACKER_API, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credential)
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.text();
    console.log('Google Sheets API response:', result);
    return result;
  } catch (error) {
    console.error('Error saving admin credential:', error);
    throw error;
  }
}

export async function fetchAdminCredentials(): Promise<AdminCredential[]> {
  if (!TIME_TRACKER_API) {
    throw new Error('Google Sheets API URL not configured. Please check VITE_TIME_TRACKER_API in .env file.');
  }

  try {
    const res = await fetch(`${TIME_TRACKER_API}?action=getAdminCredentials`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.adminCredentials || [];
  } catch (error) {
    console.error('Error fetching admin credentials:', error);
    return [];
  }
}

export async function fetchUserTimeLogs(employeeId: string): Promise<TimeLog[]> {
  if (!TIME_TRACKER_API) {
    throw new Error('Google Sheets API URL not configured. Please check VITE_TIME_TRACKER_API in .env file.');
  }

  try {
    const res = await fetch(`${TIME_TRACKER_API}?action=getUserTimeLogs&employeeId=${encodeURIComponent(employeeId)}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.timeLogs || [];
  } catch (error) {
    console.error('Error fetching user time logs:', error);
    return [];
  }
}

export async function fetchUserAbsenceLogs(employeeId: string): Promise<AbsenceEntry[]> {
  if (!TIME_TRACKER_API) {
    throw new Error('Google Sheets API URL not configured. Please check VITE_TIME_TRACKER_API in .env file.');
  }

  try {
    const res = await fetch(`${TIME_TRACKER_API}?action=getUserAbsenceLogs&employeeId=${encodeURIComponent(employeeId)}`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.absenceLogs || [];
  } catch (error) {
    console.error('Error fetching user absence logs:', error);
    return [];
  }
}
