import React, { useState } from 'react';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import TimePanel from '../components/TimePanel';
import AbsencePanel from '../components/AbsencePanel';
import TimesheetPanel from '../components/TimesheetPanel';
import StatusDisplay from '../components/StatusDisplay';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';
import { Tab } from '../types/Tab';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin]       = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>(Tab.Time);
  const [userInfo, setUserInfo]     = useState<any>(null);
  const [status, setStatus]         = useState<any>(null);
  const [location, setLocation]     = useState<any>({
    latitude: null,
    longitude: null,
    accuracy: null
  });
  const [isLogging, setIsLogging]   = useState(false);
  const [timeLogs, setTimeLogs]     = useState<any[]>([]);
  const [absenceLogs, setAbsenceLogs] = useState<any[]>([]);

  const handleLogAction = () => {
    setIsLogging(true);
    
    // Simulate geolocation request
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
          setLocation({
            latitude: "Unavailable",
            longitude: "Unavailable",
            accuracy: "Unknown"
          });
          setIsLogging(false);
        }
      );
    } else {
      setLocation({
        latitude: "Unsupported",
        longitude: "Unsupported",
        accuracy: "Unsupported"
      });
      setIsLogging(false);
    }
  };
  
  const handleAddAbsence = (absenceData: any) => {
    // In a real app, we would send this to the backend
    console.log("Adding absence:", absenceData);
    // Add the absence to the local state for demo purposes
    setAbsenceLogs([...absenceLogs, { ...absenceData, timestamp: new Date().toISOString() }]);
  };
  
  const handleLogin = () => setIsAdmin(true);
  const handleLogout = () => setIsAdmin(false);

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
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
