// Google Sheets API service for the intern time tracker
// This service communicates with the Google Apps Script backend
const GOOGLE_SHEETS_API = 'https://script.google.com/macros/s/AKfycbwCXc-dKoMKGxKoblHT6hVYu1XYbnnJX-_npLVM7r7BE1D-yc1LvnbMkZrronOk3OmB/exec';

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

// Helper function for API requests
async function makeRequest(url: string, options: RequestInit = {}): Promise<ApiResponse> {
  try {
    console.log(`Making request to: ${url}`, options);
    
    const response = await fetch(url, {
      ...options,
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
    console.error('Google Sheets API request failed:', error);
    throw error;
  }
}

// Time Logs API
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

      // Convert response to TimeLog format
      const logs = Array.isArray(response) ? response : (response.data || []);
      
      return logs.map((log: any) => ({
        _id: `${log.employeeid || log.employeeId}-${log.timestamp}-${Math.random()}`,
        firstName: log.firstname || log.firstName || '',
        lastName: log.lastname || log.lastName || '',
        employeeId: log.employeeid || log.employeeId || '',
        deviceName: log.devicename || log.deviceName || '',
        action: (log.action || '').toUpperCase() as 'IN' | 'OUT',
        timestamp: log.timestamp || '',
        rawTimestamp: new Date(log.timestamp || Date.now()).getTime(),
        latitude: log.latitude,
        longitude: log.longitude,
        accuracy: log.accuracy,
        deviceId: log.deviceid || log.deviceId,
        userAgent: log.useragent || log.userAgent,
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

  // Create a new time log
  create: async (timeLog: Omit<TimeLog, '_id' | 'createdAt' | 'updatedAt'>): Promise<TimeLog> => {
    try {
      const payload = {
        type: 'timelog',
        firstName: timeLog.firstName,
        lastName: timeLog.lastName,
        employeeId: timeLog.employeeId,
        deviceName: timeLog.deviceName,
        action: timeLog.action,
        timestamp: timeLog.timestamp,
        latitude: timeLog.latitude,
        longitude: timeLog.longitude,
        accuracy: timeLog.accuracy,
        deviceId: timeLog.deviceId,
        userAgent: timeLog.userAgent,
        timeIn: timeLog.action === 'IN' ? timeLog.timestamp : undefined,
        timeOut: timeLog.action === 'OUT' ? timeLog.timestamp : undefined,
      };

      const response = await makeRequest(GOOGLE_SHEETS_API, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create time log');
      }

      // Return the created log with potential duration
      return {
        ...timeLog,
        _id: `${timeLog.employeeId}-${timeLog.timestamp}-${Math.random()}`,
        duration: response.message?.includes('Time log added') ? '' : response.duration || '',
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

// Admin API
export const adminApi = {
  // Admin login - verify credentials
  login: async (username: string, password: string): Promise<AdminCredential> => {
    try {
      // First, get all admin credentials to verify login
      const adminList = await adminApi.getAllCredentials();
      const admin = adminList.find(a => a.username === username);
      
      if (!admin) {
        throw new Error('Invalid username or password');
      }

      // For production, you'd verify the password hash here
      // For now, we'll use the employeeId to verify admin status
      const params = new URLSearchParams({
        type: 'verifyAdmin',
        employeeId: admin.employeeId,
      });

      const response = await makeRequest(`${GOOGLE_SHEETS_API}?${params}`);
      
      if (!response.success || !response.isAdmin) {
        throw new Error('Invalid credentials or not an admin');
      }

      return {
        _id: admin._id,
        firstName: response.userData?.firstName || admin.firstName,
        lastName: response.userData?.lastName || admin.lastName,
        employeeId: response.userData?.employeeId || admin.employeeId,
        username: username,
        role: response.userData?.role || 'admin',
      };
    } catch (error) {
      console.error('Error during admin login:', error);
      throw error;
    }
  },

  // Create admin credential
  createCredential: async (credential: {
    firstName: string;
    lastName: string;
    employeeId: string;
    username: string;
    password: string;
    role?: string;
  }): Promise<AdminCredential> => {
    try {
      const payload = {
        type: 'managerPrivilege',
        firstName: credential.firstName,
        lastName: credential.lastName,
        employeeId: credential.employeeId,
        name: `${credential.firstName} ${credential.lastName}`,
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
        _id: `${admin.employeeid || admin.employeeId}-${Math.random()}`,
        firstName: admin.firstname || admin.firstName || '',
        lastName: admin.lastname || admin.lastName || '',
        employeeId: admin.employeeid || admin.employeeId || '',
        username: admin.username || admin.employeeId || '',
        role: admin.role || 'admin',
      }));
    } catch (error) {
      console.error('Error fetching admin credentials:', error);
      return [];
    }
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    // Test a simple GET request to check if the service is available
    const params = new URLSearchParams({
      type: 'adminList',
    });

    await makeRequest(`${GOOGLE_SHEETS_API}?${params}`);
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Export all APIs
export default {
  timeLogs: timeLogsApi,
  absenceLogs: absenceLogsApi,
  admin: adminApi,
  healthCheck,
};