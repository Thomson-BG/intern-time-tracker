import React, { useState, useEffect, useCallback } from 'react';
import { timeLogsApi, TimeLog } from '../utils/mongoApi';
import { downloadTimeLogsPDF } from '../utils/downloadHelpers';
import { UserInfo } from '../types';

interface TimesheetPanelProps {
  userInfo: UserInfo;
}

const TimesheetPanel: React.FC<TimesheetPanelProps> = ({ userInfo }) => {
  const [studentId, setStudentId] = useState(userInfo.employeeId);
  const [filteredLogs, setFilteredLogs] = useState<TimeLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  const loadTimesheet = useCallback(async () => {
    if (!studentId) {
      setFilteredLogs([]);
      setLogError("Please enter an Employee ID.");
      return;
    }

    setLoadingLogs(true);
    setLogError(null);
    try {
      const logs = await timeLogsApi.getAll({ employeeId: studentId });
      setFilteredLogs(logs);
    } catch (error: any) {
      console.error("Error loading timesheet:", error);
      setLogError(`Failed to load timesheet: ${error.message || 'Unknown error'}`);
      setFilteredLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      loadTimesheet();
    }
  }, [studentId, loadTimesheet]);

  const handleDownloadPdf = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    
    let namePart = 'User';
    if (userInfo.firstName && userInfo.lastName) {
      namePart = `${userInfo.firstName.charAt(0).toUpperCase()}_${userInfo.lastName}`;
    }
    
    const prefix = `${namePart}_${date}_${time}`;
    downloadTimeLogsPDF(filteredLogs, `Timesheet for ${studentId}`, prefix);
  };

  const calculateStats = () => {
    const totalEntries = filteredLogs.length;
    const checkIns = filteredLogs.filter(log => log.action === 'IN').length;
    const checkOuts = filteredLogs.filter(log => log.action === 'OUT').length;
    
    // Calculate total hours from duration strings
    let totalMinutes = 0;
    filteredLogs.forEach(log => {
      if (log.duration && log.action === 'OUT') {
        const match = log.duration.match(/(\d+) hours?, (\d+) minutes?/);
        if (match) {
          const hours = parseInt(match[1]);
          const minutes = parseInt(match[2]);
          totalMinutes += hours * 60 + minutes;
        }
      }
    });
    
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    return {
      totalEntries,
      checkIns,
      checkOuts,
      totalHours,
      remainingMinutes,
      daysWorked: checkOuts // Assuming each checkout represents a day worked
    };
  };

  const stats = calculateStats();

  if (logError) {
    return (
      <div className="glass-card p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-file-alt text-purple-400"></i>
          My Timesheet
        </h2>
        <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <i className="fas fa-exclamation-triangle text-red-400 text-xl"></i>
            <div>
              <h3 className="text-lg font-bold text-red-300">Error Loading Timesheet</h3>
              <p className="text-sm text-red-200">{logError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slide-in">
      <div className="glass-card p-6 rounded-lg border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <i className="fas fa-file-alt text-purple-400"></i>
              My Professional Timecard
            </h2>
            <div className="flex items-center space-x-2">
              <label htmlFor="timesheetStudentId" className="text-sm font-medium text-gray-300">
                Employee ID:
              </label>
              <input 
                type="text" 
                id="timesheetStudentId" 
                value={studentId} 
                onChange={e => setStudentId(e.target.value)} 
                className="px-3 py-2 border border-white/20 rounded-lg bg-black/30 text-white placeholder-gray-400 focus:ring-purple-500 focus:border-purple-500 text-sm" 
                placeholder="Enter Employee ID" 
              />
              <button 
                onClick={loadTimesheet} 
                type="button" 
                className="glass-button px-4 py-2 rounded-lg text-sm font-medium" 
                disabled={loadingLogs}
              >
                {loadingLogs ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt mr-2"></i>
                    Load
                  </>
                )}
              </button>
            </div>
          </div>
          <button 
            onClick={handleDownloadPdf} 
            disabled={!filteredLogs.length || loadingLogs} 
            className="glass-button px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-download mr-2"></i>
            Download PDF
          </button>
        </div>

        {loadingLogs ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-purple-400 text-4xl mb-4"></i>
            <p className="text-gray-300">Loading timesheet data...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-clock text-gray-500 text-4xl mb-4"></i>
            <p className="text-gray-400">No time entries found for this Employee ID.</p>
            <p className="text-gray-500 text-sm mt-2">Start tracking your time to see entries here.</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="glass p-4 rounded-lg border border-white/20 text-center">
                <p className="text-2xl font-bold text-purple-400">{stats.totalEntries}</p>
                <p className="text-gray-300 text-sm">Total Entries</p>
              </div>
              <div className="glass p-4 rounded-lg border border-white/20 text-center">
                <p className="text-2xl font-bold text-blue-400">{stats.daysWorked}</p>
                <p className="text-gray-300 text-sm">Days Worked</p>
              </div>
              <div className="glass p-4 rounded-lg border border-white/20 text-center">
                <p className="text-2xl font-bold text-green-400">
                  {stats.totalHours}h {stats.remainingMinutes}m
                </p>
                <p className="text-gray-300 text-sm">Total Hours</p>
              </div>
              <div className="glass p-4 rounded-lg border border-white/20 text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {stats.checkIns}/{stats.checkOuts}
                </p>
                <p className="text-gray-300 text-sm">In/Out</p>
              </div>
            </div>

            {/* Timesheet Table */}
            <div className="glass rounded-lg border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-black/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Device
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredLogs.map((log, i) => (
                      <tr key={log._id || `${log.rawTimestamp}-${i}`} className="hover:bg-white/5 transition-colors">
                        <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                          log.action === 'IN' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <span className="flex items-center gap-2">
                            <i className={`fas ${log.action === 'IN' ? 'fa-sign-in-alt' : 'fa-sign-out-alt'}`}></i>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {log.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {log.deviceName || 'Unknown Device'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {log.action === 'OUT' ? (log.duration || '-') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TimesheetPanel;