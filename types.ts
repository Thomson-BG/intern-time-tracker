export enum Tab {
  Time = 'Time',
  Absence = 'Absence',
  Help = 'Help',
}

export interface UserInfo {
  firstName: string;
  lastName: string;
  employeeId: string;
  deviceName: string;
}

export interface TimeLog extends UserInfo {
  action: 'IN' | 'OUT';
  timestamp: string;
  rawTimestamp: number;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  deviceId: string;
  userAgent: string;
  duration?: string;
}

export interface AbsenceLog extends UserInfo {
  date: string;
  reason: string;
  submitted: string;
}

export interface LocationState {
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    error?: string;
    status: string;
}

export interface AdminUser {
  employeeId: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager';
  assignedBy?: string;
  assignedAt?: string;
}
