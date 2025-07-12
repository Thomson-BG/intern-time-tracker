import { TimeLog, AbsenceLog } from '../types';

interface TimeLogData {
  firstName: string;
  lastName: string;
  employeeId: string;
  deviceName: string;
  action: string;
  timestamp: string;
  rawTimestamp: number;
  latitude: number | string;
  longitude: number | string;
  accuracy: number | string;
  deviceId: string;
  userAgent: string;
  duration?: string;
}

interface AbsenceData {
  firstName: string;
  lastName: string;
  employeeId: string;
  deviceName: string;
  date: string;
  reason: string;
  submitted: string;
  type: string;
}

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwCXc-dKoMKGxKoblHT6hVYu1XYbnnJX-_npLVM7r7BE1D-yc1LvnbMkZrronOk3OmB/exec";

// Generate a unique device ID and store it in localStorage
const getDeviceId = (): string => {
  const storedId = localStorage.getItem('deviceId');
  if (storedId) return storedId;
  
  const newId = 'device_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('deviceId', newId);
  return newId;
};

export const submitTimeLog = async (data: Omit<TimeLogData, 'deviceId' | 'userAgent' | 'rawTimestamp' | 'timestamp'>): Promise<{ success: boolean; message: string; log?: TimeLog }> => {
  try {
    // Add system-generated fields
    const now = new Date();
    const enhancedData = {
      ...data,
      deviceId: getDeviceId(),
      userAgent: navigator.userAgent,
      rawTimestamp: now.getTime(),
      timestamp: now.toLocaleString(),
    };
    
    const params = new URLSearchParams({
      type: 'timeLog',
      ...enhancedData as any
    }).toString();
    
    const response = await fetch(`${SCRIPT_URL}?${params}`);
    const result = await response.json();
    
    if (result.success) {
      return { 
        success: true, 
        message: "Time log submitted successfully",
        log: enhancedData as unknown as TimeLog 
      };
    } else {
      throw new Error(result.error || "Failed to submit time log");
    }
  } catch (error) {
    console.error("Error submitting time log:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
};

export const submitAbsenceLog = async (data: Omit<AbsenceData, 'submitted'>): Promise<{ success: boolean; message: string; log?: AbsenceLog }> => {
  try {
    // Add system-generated fields
    const now = new Date();
    const enhancedData = {
      ...data,
      submitted: now.toLocaleString(),
    };
    
    const params = new URLSearchParams({
      type: 'absenceLog',
      ...enhancedData as any
    }).toString();
    
    const response = await fetch(`${SCRIPT_URL}?${params}`);
    const result = await response.json();
    
    if (result.success) {
      return { 
        success: true, 
        message: "Absence log submitted successfully",
        log: enhancedData as unknown as AbsenceLog
      };
    } else {
      throw new Error(result.error || "Failed to submit absence log");
    }
  } catch (error) {
    console.error("Error submitting absence log:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "An unknown error occurred" 
    };
  }
};

// Calculate the duration between two timestamps
export const calculateDuration = (checkInTime: number, checkOutTime: number): string => {
  const diffMs = checkOutTime - checkInTime;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${diffHrs}h ${diffMins}m`;
};

// Function to retrieve time logs
export const fetchTimeLogs = async (employeeId?: string, date?: string): Promise<TimeLog[]> => {
  try {
    const queryParams = new URLSearchParams({
      type: 'getTimeLogs',
      ...(employeeId ? { employeeId } : {}),
      ...(date ? { date } : {})
    }).toString();
    
    const response = await fetch(`${SCRIPT_URL}?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      throw new Error(result.error || "Failed to fetch time logs");
    }
  } catch (error) {
    console.error("Error fetching time logs:", error);
    throw error;
  }
};

// Function to retrieve absence logs
export const fetchAbsenceLogs = async (employeeId?: string): Promise<AbsenceLog[]> => {
  try {
    const queryParams = new URLSearchParams({
      type: 'getAbsenceLogs',
      ...(employeeId ? { employeeId } : {})
    }).toString();
    
    const response = await fetch(`${SCRIPT_URL}?${queryParams}`);
    const result = await response.json();
    
    if (result.success) {
      return result.data || [];
    } else {
      throw new Error(result.error || "Failed to fetch absence logs");
    }
  } catch (error) {
    console.error("Error fetching absence logs:", error);
    throw error;
  }
};
