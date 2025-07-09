import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import TimePanel from '../components/TimePanel';
import AbsencePanel from '../components/AbsencePanel';
import TimesheetPanel from '../components/TimesheetPanel';
import StatusDisplay from '../components/StatusDisplay';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';
import { Tab } from '../types/Tab';
import { TimeLog, AbsenceLog } from '../types';
import { fetchTimeLogs, fetchAbsenceLogs } from '../utils/apiService';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Time);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [location, setLocation] = useState<any>({
    latitude: null,
    longitude: null,
    accuracy: null
  });
  const [isLogging, setIsLogging] = useState(false);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [absenceLogs, setAbsenceLogs] = useState<AbsenceLog[]>([]);
  
  // Load user info from localStorage on initial render
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const handleLogAction = () => {
    setIsLogging(true);
    
    // Request geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          setIsLogging(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setStatus({
            type: 'error',
            message: `Failed to get location: ${error.message}`
          });
          setIsLogging(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setStatus({
        type: 'error',
        message: 'Geolocation is not supported by your browser'
      });
      setIsLogging(false);
    }
  };
  
  const handleAddAbsence = () => {
    // This will be called after successful absence submission
    console.log("Absence added successfully");
    // In a real app, we would refresh the absences list here
  };
  
  const handleLogin = () => {
    setIsAdmin(true);
    // When logging in as admin, fetch the logs
    refreshAdminData();
  };

  const handleLogout = () => setIsAdmin(false);

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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <Header />
        <div className="p-6">
          {!isAdmin && <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />}
          {status && <StatusDisplay {...status} />}
          {!isAdmin ? (
            <>
              {activeTab === Tab.Time && (
                <TimePanel
                  userInfo={userInfo}
                  setUserInfo={setUserInfo}
                  onLogAction={handleLogAction}
                  location={location}
                  isLogging={isLogging}
                />
              )}
              {activeTab === Tab.Absence && (
                <AbsencePanel userInfo={userInfo} onAddAbsence={handleAddAbsence} />
              )}
              {activeTab === Tab.Timesheet && (
                <TimesheetPanel logs={timeLogs} userInfo={userInfo} />
              )}
              <AdminLogin onLogin={handleLogin} />
            </>
          ) : (
            <AdminPanel 
              logs={timeLogs} 
              absences={absenceLogs} 
              onLogout={handleLogout} 
              onRefresh={refreshAdminData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
