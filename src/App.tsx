import React, { useState } from 'react';
// Fix the import paths to point to the correct location
import Header from '../components/Header';
import { downloadTimeLogsPDF, downloadInternCertificatePDF } from '../utils/downloadHelpers';
import TabBar from '../components/TabBar';
import TimePanel from '../components/TimePanel';
import AbsencePanel from '../components/AbsencePanel';
import TimesheetPanel from '../components/TimesheetPanel';
import StatusDisplay from '../components/StatusDisplay';
import AdminLogin from '../components/AdminLogin';
import AdminPanel from '../components/AdminPanel';
import InstallButton from '../components/InstallButton';
import { Tab } from '../types/Tab';  // Import the Tab enum from the correct location

const App: React.FC = () => {
  const [isAdmin, setIsAdmin]       = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>(Tab.Time);
  const [userInfo, setUserInfo]     = useState<any>({ firstName: '', lastName: '', employeeId: '', deviceName: '' });
  const [status, setStatus]         = useState<any>(null);
  const [location, setLocation]     = useState<any>(null);
  const [isLogging, setIsLogging]   = useState(false);
  // Add some sample time logs for testing
  const [timeLogs, setTimeLogs]     = useState<any[]>([
    {
      action: 'IN',
      firstName: 'John',
      lastName: 'Smith',
      employeeId: '12345',
      timestamp: '2024-01-15 09:00:00',
      rawTimestamp: new Date('2024-01-15T09:00:00').getTime(),
      deviceName: 'Test Device'
    },
    {
      action: 'OUT',
      firstName: 'John',
      lastName: 'Smith',
      employeeId: '12345',
      timestamp: '2024-01-15 17:00:00',
      rawTimestamp: new Date('2024-01-15T17:00:00').getTime(),
      deviceName: 'Test Device'
    },
    {
      action: 'IN',
      firstName: 'John',
      lastName: 'Smith',
      employeeId: '12345',
      timestamp: '2024-01-16 09:00:00',
      rawTimestamp: new Date('2024-01-16T09:00:00').getTime(),
      deviceName: 'Test Device'
    },
    {
      action: 'OUT',
      firstName: 'John',
      lastName: 'Smith',
      employeeId: '12345',
      timestamp: '2024-01-16 16:30:00',
      rawTimestamp: new Date('2024-01-16T16:30:00').getTime(),
      deviceName: 'Test Device'
    }
  ]);
  const [absenceLogs, setAbsenceLogs] = useState<any[]>([]);

  const handleLogAction = () => {
    // your log action logic
  };
  const handleAddAbsence = () => {
    // your add absence logic
  };
  const handleLogin = () => setIsAdmin(true);

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
                <>
                  <TimesheetPanel logs={timeLogs} userInfo={userInfo} />
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      onClick={() => downloadTimeLogsPDF(timeLogs, `Timesheet for ${userInfo?.employeeId || 'User'}`, `${userInfo?.firstName || 'User'}_timesheet`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      disabled={!timeLogs.length}
                    >
                      Download Timesheet PDF
                    </button>
                    <button
                      onClick={() => downloadInternCertificatePDF(timeLogs, userInfo)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 disabled:bg-gray-400"
                      disabled={!timeLogs.length || !userInfo?.firstName || !userInfo?.lastName}
                    >
                      Download Certificate
                    </button>
                  </div>
                </>
              )}
              <AdminLogin onLogin={handleLogin} />
            </>
          ) : (
            <AdminPanel logs={timeLogs} absences={absenceLogs} onLogout={() => setIsAdmin(false)} />
          )}
          
          {/* Install Button - shows at bottom of app */}
          <InstallButton />
        </div>
      </div>
    </div>
  );
};

export default App;
