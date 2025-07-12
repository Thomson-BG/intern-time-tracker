// MongoDB API service for the intern time tracker
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API Error: ${response.status}`, data);
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('API Response:', data);
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Time Logs API
export const timeLogsApi = {
  // Get time logs with optional filters
  getAll: async (filters?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    action?: 'IN' | 'OUT';
    limit?: number;
  }): Promise<TimeLog[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.employeeId) queryParams.append('employeeId', filters.employeeId);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.action) queryParams.append('action', filters.action);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = `/time-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest<TimeLog[]>(endpoint);
    return response.data || [];
  },

  // Get today's time logs for a specific employee
  getToday: async (employeeId: string): Promise<TimeLog[]> => {
    const response = await apiRequest<TimeLog[]>(`/time-logs/today/${employeeId}`);
    return response.data || [];
  },

  // Create a new time log
  create: async (timeLog: Omit<TimeLog, '_id' | 'createdAt' | 'updatedAt'>): Promise<TimeLog> => {
    const response = await apiRequest<TimeLog>('/time-logs', {
      method: 'POST',
      body: JSON.stringify(timeLog),
    });
    if (!response.data) {
      throw new Error('Failed to create time log');
    }
    return response.data;
  },
};

// Absence Logs API
export const absenceLogsApi = {
  // Get absence logs with optional filters
  getAll: async (filters?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AbsenceLog[]> => {
    const queryParams = new URLSearchParams();
    if (filters?.employeeId) queryParams.append('employeeId', filters.employeeId);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = `/absence-logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest<AbsenceLog[]>(endpoint);
    return response.data || [];
  },

  // Create a new absence log
  create: async (absenceLog: Omit<AbsenceLog, '_id' | 'createdAt' | 'updatedAt'>): Promise<AbsenceLog> => {
    const response = await apiRequest<AbsenceLog>('/absence-logs', {
      method: 'POST',
      body: JSON.stringify(absenceLog),
    });
    if (!response.data) {
      throw new Error('Failed to create absence log');
    }
    return response.data;
  },

  // Delete an absence log
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/absence-logs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminApi = {
  // Admin login
  login: async (username: string, password: string): Promise<AdminCredential> => {
    const response = await apiRequest<AdminCredential>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (!response.data) {
      throw new Error('Login failed');
    }
    return response.data;
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
    const response = await apiRequest<AdminCredential>('/admin/credentials', {
      method: 'POST',
      body: JSON.stringify(credential),
    });
    if (!response.data) {
      throw new Error('Failed to create admin credential');
    }
    return response.data;
  },

  // Get all admin credentials
  getAllCredentials: async (): Promise<AdminCredential[]> => {
    const response = await apiRequest<AdminCredential[]>('/admin/credentials');
    return response.data || [];
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    await apiRequest('/health');
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