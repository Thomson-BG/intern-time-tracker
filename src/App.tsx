import React, { useState, useEffect } from 'react';
// Fix the import paths to point to the correct location
import Header from '../components/Header';
import { downloadTimeLogsPDF } from '../utils/downloadHelpers';
import TabBar from '../components/TabBar';
import TimePanel from '../components/TimePanel';
import AbsencePanel from '../components/AbsencePanel';
import TimesheetPanel from '../components/TimesheetPanel';
import StatusDisplay from '../components/StatusDisplay';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';
import Notification from '../components/Notification';
import { Tab } from '../types/Tab';  // Import the Tab enum from the correct location
import { logTime, TimeLog, syncOfflineEntries } from '../utils/timeTrackerApi';
import { UserInfo, LocationState } from '../types';
import { OfflineStorage, isOnline, addOnlineListener, addOfflineListener } from '../utils/offlineStorage';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin]       = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>(Tab.Time);
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
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  const [onlineStatus, setOnlineStatus] = useState(isOnline());

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

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = async () => {
      setOnlineStatus(true);
      setNotification({
        message: 'Connection restored! Syncing offline data...',
        type: 'info'
      });
      
      try {
        const result = await syncOfflineEntries();
        if (result.synced > 0) {
          setNotification({
            message: `Successfully synced ${result.synced} offline entries!`,
            type: 'success'
          });
        }
      } catch (error) {
        setNotification({
          message: 'Failed to sync some offline entries. They will be retried later.',
          type: 'warning'
        });
      }
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      setNotification({
        message: 'You are offline. Entries will be saved locally and synced when connection is restored.',
        type: 'warning'
      });
    };

    const unsubscribeOnline = addOnlineListener(handleOnline);
    const unsubscribeOffline = addOfflineListener(handleOffline);

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, []);

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

      // Send to data API
      await logTime(timeEntry);
      
      // Update local state
      setIsCheckedIn(action === 'IN');
      
      // Show success message
      const actionText = action === 'IN' ? 'checked in' : 'checked out';
      const timeString = new Date().toLocaleString();
      const isOffline = !onlineStatus;
      
      setStatus({
        message: `Successfully ${actionText} at ${timeString}${isOffline ? ' (saved offline)' : ''}`,
        type: 'success',
        timestamp: timeString
      });

      // Show notification for offline saves
      if (isOffline) {
        setNotification({
          message: 'Entry saved offline and will sync when connection is restored.',
          type: 'info'
        });
      }

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
  const handleAddAbsence = (absenceData: { date: string; type: string; reason: string }) => {
    // Validate required fields
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.employeeId) {
      setStatus({
        message: 'Please fill in your personal information first (First Name, Last Name, and Employee ID)',
        type: 'error'
      });
      return;
    }

    if (!absenceData.date || !absenceData.type) {
      setStatus({
        message: 'Please fill in the absence date and type',
        type: 'error'
      });
      return;
    }

    try {
      // Create absence log entry
      const absenceEntry = {
        type: 'absencelog',
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        employeeId: userInfo.employeeId,
        deviceName: userInfo.deviceName || 'Unknown Device',
        absenceDate: absenceData.date,
        absenceType: absenceData.type,
        reason: absenceData.reason || '',
        timestamp: new Date().toISOString(),
        deviceId: `${navigator.platform}-${navigator.userAgent.slice(0, 50)}`,
        userAgent: navigator.userAgent
      };

      // Add to local absence logs
      setAbsenceLogs(prev => [...prev, absenceEntry]);

      // Show success message
      setStatus({
        message: `Absence request submitted successfully for ${absenceData.date}`,
        type: 'success',
        timestamp: new Date().toLocaleString()
      });

      // TODO: In a real implementation, you might want to send this to the same 
      // data API or a different endpoint for absence tracking
      // await logTime(absenceEntry);

    } catch (error) {
      console.error('Error submitting absence:', error);
      setStatus({
        message: `Failed to submit absence request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    }
  };
  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAdmin(true);
    } else {
      setStatus({
        message: 'Invalid username or password',
        type: 'error'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="max-w-3xl mx-auto glass-dark rounded-2xl shadow-2xl overflow-hidden float">
        {/* Online/Offline Status */}
        <div className={`w-full px-4 py-2 flex items-center justify-center space-x-2 text-sm ${
          onlineStatus ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
        }`}>
          <i className={`fas ${onlineStatus ? 'fa-wifi' : 'fa-wifi-slash'}`}></i>
          <span>{onlineStatus ? 'Online' : 'Offline Mode'}</span>
          {!onlineStatus && OfflineStorage.getEntryCount() > 0 && (
            <span className="bg-yellow-500/30 px-2 py-1 rounded-full text-xs">
              {OfflineStorage.getEntryCount()} pending sync
            </span>
          )}
        </div>
        
        <Header />
        <div className="p-6">
          {!isAdmin && <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />}
          {status && <StatusDisplay message={status.message} type={status.type} timestamp={status.timestamp} />}
          {!isAdmin ? (
            <>
              {activeTab === Tab.Time && (
                <TimePanel
                  userInfo={userInfo}
                  setUserInfo={setUserInfo}
                  onLogAction={handleLogAction}
                  location={location}
                  isLogging={isLogging}
                  isCheckedIn={isCheckedIn}
                />
              )}
              {activeTab === Tab.Absence && (
                <AbsencePanel userInfo={userInfo} onAddAbsence={handleAddAbsence} />
              )}
              {activeTab === Tab.Timesheet && (
                <>
                  <TimesheetPanel logs={timeLogs} userInfo={userInfo} />
                </>
              )}
              <AdminLogin onLogin={handleLogin} />
            </>
          ) : (
            <AdminPanel logs={timeLogs} absences={absenceLogs} onLogout={() => setIsAdmin(false)} />
          )}
        </div>
        
        {/* Footer */}
        <footer className="glass-light border-t border-white/20 p-4 flex items-center justify-center space-x-3">
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Thomson Innovations Logo" className="w-8 h-8" />
            <span className="text-white font-medium text-sm">Thomson Innovations - 2025</span>
          </div>
          <span className="text-white/70 text-xs">© All rights reserved</span>
        </footer>
      </div>
      
      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default App;
