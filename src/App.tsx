import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { downloadTimeLogsPDF } from '../utils/downloadHelpers';
import TabBar from '../components/TabBar';
import TimePanel from '../components/TimePanel';
import AbsencePanel from '../components/AbsencePanel';
import TimesheetPanel from '../components/TimesheetPanel';
import StatusDisplay from '../components/StatusDisplay';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';
import StudentHelpPanel from '../components/StudentHelpPanel';
import OnboardingTooltip from '../components/OnboardingTooltip';
import { Tab } from '../types/Tab';  // Import the Tab enum from the correct location
import { logTime, TimeLog } from '../utils/timeTrackerApi';
import { UserInfo, LocationState } from '../types';
import { fetchTimeLogs, fetchAbsenceLogs } from '../utils/apiService';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'manager'>('admin');
  const [currentUser, setCurrentUser] = useState<{ employeeId: string; firstName: string; lastName: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Time);
  const [userInfo, setUserInfo]     = useState<UserInfo>({
    firstName: '',
    lastName: '',
    employeeId: '',
    deviceName: ''
  });
  const [status, setStatus]         = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    timestamp?: string;
  } | null>(null);
  const [location, setLocation]     = useState<LocationState>({
    latitude: undefined,
    longitude: undefined,
    accuracy: undefined,
    error: undefined,
    status: 'idle'
  });
  const [isLogging, setIsLogging]   = useState(false);
  const [timeLogs, setTimeLogs]     = useState<any[]>([]);
  const [absenceLogs, setAbsenceLogs] = useState<any[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Load user info from localStorage on initial render
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  // Get user's location
  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      setLocation(prev => ({ ...prev, status: 'requesting' }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            error: undefined,
            status: 'success' as const
          };
          setLocation(newLocation);
          resolve(position);
        },
        (error) => {
          const errorMsg = error.message || 'Unable to retrieve location';
          setLocation(prev => ({
            ...prev,
            error: errorMsg,
            status: 'error'
          }));
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000, // Reduced timeout to 5 seconds
          maximumAge: 60000
        }
      );
    });
  };

  // Clear status message after 5 seconds
  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => {
        setStatus(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleLogAction = async (action: 'IN' | 'OUT') => {
    if (isLogging) return;
    
    // Validate required fields
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.employeeId) {
      setStatus({
        message: 'Please fill in First Name, Last Name, and Employee ID',
        type: 'error'
      });
      return;
    }

    setIsLogging(true);
    
    try {
      let latitude: number | undefined;
      let longitude: number | undefined;
      let accuracy: number | undefined;
      
      // Try to get current location, but don't fail if it's not available
      try {
        const position = await getCurrentLocation();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        accuracy = position.coords.accuracy;
      } catch (locationError) {
        console.warn('Location not available:', locationError);
        // Continue without location data
        setLocation(prev => ({
          ...prev,
          error: 'Location not available - continuing without location data',
          status: 'error'
        }));
      }
      
      const timestamp = new Date().toISOString();
      const deviceId = `${navigator.platform}-${navigator.userAgent.slice(0, 50)}`;
      
      const timeEntry: TimeLog = {
        type: 'timelog',
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        employeeId: userInfo.employeeId,
        deviceName: userInfo.deviceName || 'Unknown Device',
        action,
        timestamp,
        latitude,
        longitude,
        accuracy,
        deviceId,
        userAgent: navigator.userAgent
      };

      // Send to Google Sheets
      const result = await logTime(timeEntry);
      
      // Update local state
      setIsCheckedIn(action === 'IN');
      
      // Show success message with API result
      const actionText = action === 'IN' ? 'checked in' : 'checked out';
      const timeString = new Date().toLocaleString();
      setStatus({
        message: `Successfully ${actionText} at ${timeString}. Google Sheets: ${result}`,
        type: 'success',
        timestamp: timeString
      });

      // Add to local logs for timesheet
      setTimeLogs(prev => [...prev, {
        ...timeEntry,
        rawTimestamp: Date.now()
      }]);

    } catch (error) {
      console.error('Error logging time:', error);
      setStatus({
        message: `Failed to ${action === 'IN' ? 'check in' : 'check out'}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsLogging(false);
    }
  };

  // Test function for development - bypasses location
  const handleTestLogAction = async (action: 'IN' | 'OUT') => {
    if (isLogging) return;
    
    // Validate required fields
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.employeeId) {
      setStatus({
        message: 'Please fill in First Name, Last Name, and Employee ID',
        type: 'error'
      });
      return;
    }

    setIsLogging(true);
    
    try {
      const timestamp = new Date().toISOString();
      const deviceId = `${navigator.platform}-${navigator.userAgent.slice(0, 50)}`;
      
      const timeEntry: TimeLog = {
        type: 'timelog',
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        employeeId: userInfo.employeeId,
        deviceName: userInfo.deviceName || 'Test Device',
        action,
        timestamp,
        latitude: 40.7128, // Mock NYC coordinates for testing
        longitude: -74.0060,
        accuracy: 10,
        deviceId,
        userAgent: navigator.userAgent
      };

      // Send to Google Sheets
      const result = await logTime(timeEntry);
      
      // Update local state
      setIsCheckedIn(action === 'IN');
      
      // Show success message with API result
      const actionText = action === 'IN' ? 'checked in' : 'checked out';
      const timeString = new Date().toLocaleString();
      setStatus({
        message: `Successfully ${actionText} at ${timeString} (Test Mode - Mock Location Used). Google Sheets: ${result}`,
        type: 'success',
        timestamp: timeString
      });

      // Update location display for testing
      setLocation({
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        status: 'success',
        error: undefined
      });

      // Add to local logs for timesheet
      setTimeLogs(prev => [...prev, {
        ...timeEntry,
        rawTimestamp: Date.now()
      }]);

    } catch (error) {
      console.error('Error logging time:', error);
      setStatus({
        message: `Failed to ${action === 'IN' ? 'check in' : 'check out'}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsLogging(false);
    }
  };
  const handleAddAbsence = (absenceData: any) => {
    // Add to local logs for admin panel
    setAbsenceLogs(prev => [...prev, absenceData]);
  };
  const handleLogin = (success: boolean, userRole?: 'admin' | 'manager', currentUser?: { employeeId: string; firstName: string; lastName: string }) => {
    setIsAdmin(success);
    if (success && userRole && currentUser) {
      setCurrentUserRole(userRole);
      setCurrentUser(currentUser);
      // When logging in as admin, fetch the logs
      refreshAdminData();
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setCurrentUserRole('admin');
    setCurrentUser(null);
  };

  const refreshAdminData = async () => {
    try {
      // In a real app, we would fetch logs from the API
      const date = new Date().toISOString().split('T')[0]; // Today's date
      const [newTimeLogs, newAbsenceLogs] = await Promise.all([
        fetchTimeLogs(undefined, date),
        fetchAbsenceLogs()
      ]);
      
      setTimeLogs(newTimeLogs);
      setAbsenceLogs(newAbsenceLogs);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="glass-card rounded-2xl overflow-hidden hover-lift transition-all duration-300">
          <Header />
          <div className="p-8">
            {!isAdmin && <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />}
            {status && <StatusDisplay message={status.message} type={status.type} timestamp={status.timestamp} />}
            {!isAdmin ? (
              <>
                {activeTab === Tab.Time && (
                  <OnboardingTooltip
                    id="time-tracking"
                    title="Welcome to Time Tracking!"
                    content="Fill in your information and use the buttons to clock in and out. Your location helps verify you're at the right workplace."
                  >
                    <TimePanel
                      userInfo={userInfo}
                      setUserInfo={setUserInfo}
                      onLogAction={handleLogAction}
                      onTestLogAction={handleTestLogAction}
                      location={location}
                      isLogging={isLogging}
                      isCheckedIn={isCheckedIn}
                    />
                  </OnboardingTooltip>
                )}
                {activeTab === Tab.Absence && (
                  <OnboardingTooltip
                    id="absence-reporting"
                    title="Absence Reporting"
                    content="Always report when you can't come to work! Choose the type of absence and add details if needed. This helps supervisors plan coverage."
                  >
                    <AbsencePanel 
                      userInfo={userInfo} 
                      onAddAbsence={handleAddAbsence}
                      onStatusUpdate={setStatus}
                    />
                  </OnboardingTooltip>
                )}
                {activeTab === Tab.Timesheet && (
                  <>
                    <OnboardingTooltip
                      id="timesheet-view"
                      title="Your Digital Timesheet"
                      content="Review your work history here and download PDF reports for your records. Keep track of your professional growth!"
                    >
                      <TimesheetPanel logs={timeLogs} userInfo={userInfo} />
                    </OnboardingTooltip>
                    <div className="mt-6 text-right">
                      <button
                        onClick={() => downloadTimeLogsPDF(timeLogs, userInfo)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ml-auto hover-lift shadow-lg"
                      >
                        <i className="fas fa-download"></i>
                        Download Timesheet PDF
                      </button>
                    </div>
                  </>
                )}
                {activeTab === Tab.Help && (
                  <StudentHelpPanel />
                )}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <AdminLogin onLogin={handleLogin} />
                </div>
              </>
            ) : (
              <AdminPanel 
                logs={timeLogs} 
                absences={absenceLogs} 
                onLogout={handleLogout}
                currentUserRole={currentUserRole}
                currentUser={currentUser}
                onRefresh={refreshAdminData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
