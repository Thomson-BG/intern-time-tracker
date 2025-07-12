// Enhanced Features for Time Tracking Application
// Research-based additional features commonly found in modern time tracking systems

import React, { useState, useEffect } from 'react';

// 1. Geofencing Feature - Automatic check-in/out based on location
export interface GeofenceConfig {
  workLocation: {
    name: string;
    latitude: number;
    longitude: number;
    radius: number; // in meters
  };
  autoCheckIn: boolean;
  autoCheckOut: boolean;
}

// 2. Break Time Tracking
export interface BreakEntry {
  breakType: 'lunch' | 'break' | 'meeting' | 'other';
  startTime: string;
  endTime?: string;
  duration?: number;
  note?: string;
}

// 3. Project/Task Time Allocation
export interface ProjectEntry {
  projectId: string;
  projectName: string;
  taskDescription: string;
  timeSpent: number;
  billable: boolean;
}

// 4. Work Schedule Management
export interface WorkSchedule {
  employeeId: string;
  scheduleType: 'fixed' | 'flexible' | 'shift';
  workDays: string[]; // ['monday', 'tuesday', etc.]
  startTime: string;
  endTime: string;
  totalHours: number;
}

// 5. Overtime Tracking
export interface OvertimeEntry {
  date: string;
  regularHours: number;
  overtimeHours: number;
  overtimeRate: number;
  approved: boolean;
  approvedBy?: string;
}

// 6. GPS Tracking with Route Visualization
export interface GPSRoute {
  employeeId: string;
  date: string;
  checkInLocation: { lat: number; lng: number; address: string };
  checkOutLocation: { lat: number; lng: number; address: string };
  workRoute?: { lat: number; lng: number; timestamp: string }[];
}

// 7. Team Management Features
export interface TeamManagement {
  teamId: string;
  teamName: string;
  managerId: string;
  members: string[];
  department: string;
}

// 8. Real-time Dashboard
export interface RealTimeDashboard {
  activeEmployees: number;
  currentlyWorking: { employeeId: string; checkInTime: string; duration: string }[];
  todaysSummary: {
    totalHours: number;
    averageHours: number;
    lateArrivals: number;
    earlyDepartures: number;
  };
}

// 9. Approval Workflow
export interface ApprovalRequest {
  requestId: string;
  type: 'timesheet' | 'absence' | 'overtime';
  requestedBy: string;
  requestedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  comments?: string;
}

// 10. Mobile App Capabilities
export interface MobileFeatures {
  offlineMode: boolean;
  pushNotifications: boolean;
  biometricAuth: boolean;
  quickActions: string[];
}

// 11. Integration Capabilities
export interface IntegrationSettings {
  payrollSystem: {
    enabled: boolean;
    provider: string;
    apiKey?: string;
  };
  hrSystem: {
    enabled: boolean;
    provider: string;
    syncInterval: number;
  };
  calendarIntegration: {
    enabled: boolean;
    provider: 'google' | 'outlook' | 'other';
  };
}

// 12. Advanced Reporting
export interface ReportingCapabilities {
  customReports: boolean;
  scheduledReports: boolean;
  exportFormats: string[];
  chartTypes: string[];
  realTimeReports: boolean;
}

// Implementation of Smart Notifications Feature
export const SmartNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'reminder' | 'warning' | 'info';
    message: string;
    timestamp: string;
    priority: 'low' | 'medium' | 'high';
  }>>([]);

  useEffect(() => {
    // Check for various notification triggers
    const checkNotifications = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Work start reminder
      if (currentHour === 8 && currentMinute === 45) {
        setNotifications(prev => [...prev, {
          id: Date.now().toString(),
          type: 'reminder',
          message: 'Work starts in 15 minutes. Don\'t forget to check in!',
          timestamp: now.toISOString(),
          priority: 'medium'
        }]);
      }

      // Break reminder (every 2 hours)
      if (currentMinute === 0 && [10, 12, 14, 16].includes(currentHour)) {
        setNotifications(prev => [...prev, {
          id: Date.now().toString(),
          type: 'info',
          message: 'Time for a break! Remember to stay hydrated and stretch.',
          timestamp: now.toISOString(),
          priority: 'low'
        }]);
      }

      // End of day reminder
      if (currentHour === 17 && currentMinute === 0) {
        setNotifications(prev => [...prev, {
          id: Date.now().toString(),
          type: 'reminder',
          message: 'Work day is ending. Don\'t forget to check out!',
          timestamp: now.toISOString(),
          priority: 'high'
        }]);
      }
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="smart-notifications">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification ${notification.priority}`}>
          <i className={`fas ${notification.type === 'reminder' ? 'fa-bell' : 
                              notification.type === 'warning' ? 'fa-exclamation-triangle' : 
                              'fa-info-circle'}`}></i>
          <span>{notification.message}</span>
          <button onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

// Work-Life Balance Insights
export interface WorkLifeBalance {
  averageWorkHours: number;
  workDaysThisWeek: number;
  overtimeThisMonth: number;
  breakTimeRatio: number;
  stressLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// Team Collaboration Features
export interface TeamCollaboration {
  teamChat: boolean;
  sharedCalendar: boolean;
  taskAssignment: boolean;
  fileSharing: boolean;
  videoConferencing: boolean;
}

// Performance Analytics
export interface PerformanceMetrics {
  productivityScore: number;
  attendanceRate: number;
  punctualityScore: number;
  goalsAchieved: number;
  improvementAreas: string[];
}