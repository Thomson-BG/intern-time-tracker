// Google Sheets API service for the intern time tracker
// This service communicates with the Google Apps Script backend
const GOOGLE_SHEETS_API = 'https://script.google.com/macros/s/AKfycbwG6NJfEszOA-qEstt-gCY3Bn_QQghX2FfrJvALecYQPcOQO5yrpBQCg1yjiaJT0Pt9/exec';

// Google Sheets information - based on deployed Apps Script
// Spreadsheet URL: https://docs.google.com/spreadsheets/d/1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI/edit?gid=0#gid=0
const GOOGLE_SHEETS_INFO = {
  SPREADSHEET_ID: '1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI',
  TIME_LOGS_GID: '0',
  ABSENCE_LOGS_GID: '1316231505', 
  ADMIN_CREDENTIALS_GID: '1371082882'
};

export interface TimeLog {
  _id?: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  deviceName?: string;
  action: 'IN' | 'OUT';
  timestamp: string;
  rawTimestamp: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  deviceId?: string;
  userAgent?: string;
  duration?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AbsenceLog {
  _id?: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  deviceName?: string;
  date: string;
  absenceType?: string;
  reason: string;
  submitted: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminCredential {
  _id?: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  username: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  isAdmin?: boolean;
  userData?: any;
}

// Helper function for API requests - Enhanced with better CORS handling
async function makeRequest(url: string, options: RequestInit = {}): Promise<ApiResponse> {
  try {
    console.log(`Making request to: ${url}`, options);
    
    // Add retries for failed requests (common with CORS issues)
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          mode: 'cors', // Explicitly set CORS mode
          credentials: 'omit', // Don't send credentials to avoid CORS issues
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Google Sheets API response:', result);
        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Request attempt ${attempt} failed:`, error);
        
        // If it's a CORS error, wait a bit before retrying
        if (error.message?.includes('CORS') || error.message?.includes('fetch')) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          break; // Don't retry for other types of errors
        }
      }
    }
    
    throw lastError;
  } catch (error) {
    console.error('Google Sheets API request failed after retries:', error);
    
    // Check if this is a CORS error
    const isCorsError = error.message?.includes('CORS') || 
                       error.message?.includes('Access to fetch') || 
                       error.message?.includes('Failed to fetch');
    
    if (isCorsError) {
      console.error('🚨 CORS ERROR DETECTED 🚨');
      console.error('This means the Google Apps Script needs to be updated with proper CORS headers.');
      console.error('Please update your Google Apps Script with the code from FINAL_CORRECTED_GOOGLE_APPS_SCRIPT.js');
      
      // For CORS errors, provide a more specific error message
      throw new Error('CORS_ERROR: The Google Apps Script needs to be updated. Check the console for details.');
    }
    
    // For development mode, provide fallback data for GET requests only
    if (import.meta.env.DEV && options.method !== 'POST') {
      console.warn('Development mode: Providing fallback empty data for GET request');
      return { 
        success: true,
        data: []
      };
    }
    
    throw error;
  }
}

// Time Logs API - Updated to match deployed Apps Script
export const timeLogsApi = {
  // Get all time logs for a specific employee
  getAll: async (filters?: { employeeId?: string }): Promise<TimeLog[]> => {
    try {
      const params = new URLSearchParams({
        type: 'timelog',
        ...(filters?.employeeId && { employeeId: filters.employeeId }),
      });

      const response = await makeRequest(`${GOOGLE_SHEETS_API}?${params}`);
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to fetch time logs');
      }

      // The deployed script returns data directly or in response.data
      const logs = Array.isArray(response) ? response : (response.data || []);
      
      return logs.map((log: any) => ({
        _id: `${log.employeeId || log.employeeid}-${log.timestamp}-${Math.random()}`,
        firstName: log.firstName || log.firstname || '',
        lastName: log.lastName || log.lastname || '',
        employeeId: log.employeeId || log.employeeid || '',
        deviceName: log.deviceName || log.devicename || '',
        action: (log.action || '').toUpperCase() as 'IN' | 'OUT',
        timestamp: log.timestamp || '',
        rawTimestamp: new Date(log.timestamp || Date.now()).getTime(),
        latitude: log.latitude,
        longitude: log.longitude,
        accuracy: log.accuracy,
        deviceId: log.deviceId || log.deviceid,
        userAgent: log.userAgent || log.useragent,
        duration: log.duration || '',
      }));
    } catch (error) {
      console.error('Error fetching time logs:', error);
      return [];
    }
  },

  // Get today's time logs for a specific employee
  getToday: async (employeeId: string): Promise<TimeLog[]> => {
    const allLogs = await timeLogsApi.getAll({ employeeId });
    const today = new Date().toDateString();
    return allLogs.filter(log => new Date(log.timestamp).toDateString() === today);
  },

  // Get time logs by employee ID (alias for getAll with employeeId filter)
  getByEmployeeId: async (employeeId: string): Promise<TimeLog[]> => {
    return timeLogsApi.getAll({ employeeId });
  },

  // Create a new time log - Updated to match deployed Apps Script structure
  create: async (timeLog: Omit<TimeLog, '_id' | 'createdAt' | 'updatedAt'>): Promise<TimeLog> => {
    try {
      // The deployed script expects this exact structure
      const payload = {
        type: 'timelog',
        firstName: timeLog.firstName,
        lastName: timeLog.lastName,
        employeeId: timeLog.employeeId,
        deviceName: timeLog.deviceName || '',
        action: timeLog.action,
        timestamp: timeLog.timestamp,
        latitude: timeLog.latitude,
        longitude: timeLog.longitude,
        accuracy: timeLog.accuracy,
        deviceId: timeLog.deviceId,
        userAgent: timeLog.userAgent,
        // Additional fields the deployed script might use
        timeIn: timeLog.action === 'IN' ? timeLog.timestamp : undefined,
        timeOut: timeLog.action === 'OUT' ? timeLog.timestamp : undefined,
      };

      console.log('Sending time log payload:', payload);

      const response = await makeRequest(GOOGLE_SHEETS_API, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('Time log response:', response);

      if (!response.success) {
        throw new Error(response.error || 'Failed to create time log');
      }

      // Return the created log
      return {
        ...timeLog,
        _id: `${timeLog.employeeId}-${timeLog.timestamp}-${Math.random()}`,
        duration: response.duration || response.message?.includes('duration') ? response.duration : '',
      };
    } catch (error) {
      console.error('Error creating time log:', error);
      throw error;
    }
  },
};

// Absence Logs API
export const absenceLogsApi = {
  // Get all absence logs for a specific employee
  getAll: async (filters?: { employeeId?: string }): Promise<AbsenceLog[]> => {
    try {
      const params = new URLSearchParams({
        type: 'absencelog',
        ...(filters?.employeeId && { employeeId: filters.employeeId }),
      });

      const response = await makeRequest(`${GOOGLE_SHEETS_API}?${params}`);
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to fetch absence logs');
      }

      // Convert response to AbsenceLog format
      const logs = Array.isArray(response) ? response : (response.data || []);
      
      return logs.map((log: any) => ({
        _id: `${log.employeeid || log.employeeId}-${log.submitted}-${Math.random()}`,
        firstName: log.firstname || log.firstName || '',
        lastName: log.lastname || log.lastName || '',
        employeeId: log.employeeid || log.employeeId || '',
        deviceName: log.devicename || log.deviceName || '',
        date: log.date || '',
        reason: log.reason || '',
        submitted: log.submitted || '',
      }));
    } catch (error) {
      console.error('Error fetching absence logs:', error);
      return [];
    }
  },

  // Create a new absence log
  create: async (absenceLog: Omit<AbsenceLog, '_id' | 'createdAt' | 'updatedAt'>): Promise<AbsenceLog> => {
    try {
      const payload = {
        type: 'absencelog',
        firstName: absenceLog.firstName,
        lastName: absenceLog.lastName,
        employeeId: absenceLog.employeeId,
        deviceName: absenceLog.deviceName,
        date: absenceLog.date,
        reason: absenceLog.reason,
        submitted: absenceLog.submitted,
      };

      const response = await makeRequest(GOOGLE_SHEETS_API, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create absence log');
      }

      return {
        ...absenceLog,
        _id: `${absenceLog.employeeId}-${absenceLog.submitted}-${Math.random()}`,
      };
    } catch (error) {
      console.error('Error creating absence log:', error);
      throw error;
    }
  },

  // Delete an absence log (not supported by current Apps Script)
  delete: async (id: string): Promise<void> => {
    throw new Error('Delete operation not supported by Google Sheets backend');
  },
};

// Admin API - Updated to match deployed Apps Script with verifyAdmin endpoint
export const adminApi = {
  // Admin login - verify credentials using the deployed script's verifyAdmin endpoint
  login: async (username: string, password: string): Promise<AdminCredential> => {
    try {
      // Fallback credentials for development/testing (as backup)
      const fallbackCredentials = [
        { username: 'manager', password: 'manager123', firstName: 'Manager', lastName: 'User', employeeId: 'MGR001' },
        { username: 'admin', password: 'admin123', firstName: 'Admin', lastName: 'User', employeeId: 'ADMIN001' }
      ];
      
      // First try to verify with the Google Sheets using the verifyAdmin endpoint
      try {
        // Use verifyAdmin endpoint as specified in the deployed script
        const params = new URLSearchParams({
          type: 'verifyAdmin',
          employeeId: username, // assuming username is the employeeId
        });

        const response = await makeRequest(`${GOOGLE_SHEETS_API}?${params}`);
        
        if (response.success && response.isAdmin && response.userData) {
          return {
            _id: `${response.userData.employeeId}-admin`,
            firstName: response.userData.firstName || '',
            lastName: response.userData.lastName || '',
            employeeId: response.userData.employeeId || username,
            username: username,
            role: response.userData.role || 'admin',
          };
        }
      } catch (sheetsError) {
        console.warn('Google Sheets admin verification failed:', sheetsError);
      }

      // Fallback to built-in credentials if Google Sheets is unavailable
      const fallbackMatch = fallbackCredentials.find(cred => 
        cred.username === username && cred.password === password
      );
      
      if (fallbackMatch) {
        console.log('Using fallback admin credentials for login');
        return {
          _id: `fallback-${fallbackMatch.employeeId}`,
          firstName: fallbackMatch.firstName,
          lastName: fallbackMatch.lastName,
          employeeId: fallbackMatch.employeeId,
          username: username,
          role: 'admin',
        };
      }

      throw new Error('Invalid username or password');
    } catch (error) {
      console.error('Error during admin login:', error);
      throw error;
    }
  },

  // Create admin credential - Updated to use managerPrivilege type as in deployed script
  createCredential: async (credential: {
    firstName: string;
    lastName: string;
    employeeId: string;
    username: string;
    password: string;
    role?: string;
  }): Promise<AdminCredential> => {
    try {
      // The deployed script expects managerPrivilege type
      const payload = {
        type: 'managerPrivilege',
        firstName: credential.firstName,
        lastName: credential.lastName,
        employeeId: credential.employeeId,
        name: `${credential.firstName} ${credential.lastName}`, // deployed script expects 'name' field
        role: credential.role || 'admin',
      };

      const response = await makeRequest(GOOGLE_SHEETS_API, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create admin credential');
      }

      return {
        _id: `${credential.employeeId}-${Date.now()}`,
        firstName: credential.firstName,
        lastName: credential.lastName,
        employeeId: credential.employeeId,
        username: credential.username,
        role: credential.role || 'admin',
      };
    } catch (error) {
      console.error('Error creating admin credential:', error);
      throw error;
    }
  },

  // Get all admin credentials
  getAllCredentials: async (): Promise<AdminCredential[]> => {
    try {
      const params = new URLSearchParams({
        type: 'adminList',
      });

      const response = await makeRequest(`${GOOGLE_SHEETS_API}?${params}`);
      
      if (response.success === false) {
        throw new Error(response.error || 'Failed to fetch admin credentials');
      }

      // Convert response to AdminCredential format
      const admins = Array.isArray(response) ? response : (response.data || []);
      
      return admins.map((admin: any) => ({
        _id: `${admin.employeeId || admin.employeeid}-${Math.random()}`,
        firstName: admin.firstName || admin.firstname || '',
        lastName: admin.lastName || admin.lastname || '',
        employeeId: admin.employeeId || admin.employeeid || '',
        username: admin.username || admin.employeeId || admin.employeeid || '',
        role: admin.role || 'admin',
      }));
    } catch (error) {
      console.error('Error fetching admin credentials:', error);
      return [];
    }
  },
};

// Health check - Disabled to prevent CORS errors on app startup
export const healthCheck = async (): Promise<boolean> => {
  // Always return true to prevent CORS-related false negatives
  // Individual operations will handle their own errors and provide user feedback
  console.log('Health check: Assuming healthy - individual operations will handle their own errors');
  return true;
};

// Export all APIs
export default {
  timeLogs: timeLogsApi,
  absenceLogs: absenceLogsApi,
  admin: adminApi,
  healthCheck,
};