export interface TimeLog {
  firstName: string;
  lastName: string;
  employeeId: string;
  action: string;
  timestamp: string;
  rawTimestamp?: number;
  latitude?: number | string;
  longitude?: number | string;
  accuracy?: number | string;
  deviceName?: string;
  deviceId?: string;
  userAgent?: string;
  duration?: string;
}

export interface AbsenceLog {
  firstName: string;
  lastName: string;
  employeeId: string;
  deviceName?: string;
  date: string;
  reason: string;
  type: string;
  submitted: string;
}
