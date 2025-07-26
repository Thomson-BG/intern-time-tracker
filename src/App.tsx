import React, { useState } from 'react';
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
import { Tab } from '../types/Tab';  // Import the Tab enum from the correct location

const App: React.FC = () => {
  const [isAdmin, setIsAdmin]       = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>(Tab.Time);
  const [userInfo, setUserInfo]     = useState<any>(null);
  const [status, setStatus]         = useState<any>(null);
  const [location, setLocation]     = useState<any>(null);
  const [isLogging, setIsLogging]   = useState(false);
  const [timeLogs, setTimeLogs]     = useState<any[]>([]);
  const [absenceLogs, setAbsenceLogs] = useState<any[]>([]);

  const handleLogAction = () => {
    // your log action logic
  };
  const handleAddAbsence = () => {
    // your add absence logic
  };
  const handleLogin = () => setIsAdmin(true);

  return (
    <div className="min-h-screen bg-csea-navy">
      <div className="container mx-auto px-4 py-8 pb-20"> {/* Added bottom padding for fixed nav */}
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <Header />
          <div className="p-6">
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
                    <div className="mt-4 text-right">
                      <button
                        onClick={() => downloadTimeLogsPDF(timeLogs, userInfo)}
                        className="bg-csea-yellow text-csea-navy px-6 py-3 rounded-md hover:bg-yellow-400 font-semibold transition-colors"
                      >
                        Download Timesheet PDF
                      </button>
                    </div>
                  </>
                )}
                <AdminLogin onLogin={handleLogin} />
              </>
            ) : (
              <AdminPanel logs={timeLogs} absences={absenceLogs} onLogout={() => setIsAdmin(false)} />
            )}
          </div>
        </div>
      </div>
      {!isAdmin && <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />}
    </div>
  );
};

export default App;
