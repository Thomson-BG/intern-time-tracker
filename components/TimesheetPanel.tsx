import React, { useState, useMemo } from 'react';
import { downloadTimeLogsPDF } from '../utils/downloadHelpers';
import { calculateWorkSessions, calculateTotalHours, formatDuration } from '../utils/workHourCalculator';

interface TimesheetPanelProps {
  logs: any[];
  userInfo: any;
}

const TimesheetPanel: React.FC<TimesheetPanelProps> = ({ logs, userInfo }) => {
  const [employeeId, setEmployeeId] = useState(userInfo?.employeeId || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Filter logs based on employee ID and date range
  const filteredLogs = logs.filter(log => {
    let matches = true;
    
    // Filter by employee ID if provided
    if (employeeId && log.employeeId !== employeeId) {
      matches = false;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      const logDate = new Date(log.rawTimestamp || log.timestamp);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (logDate < start) matches = false;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (logDate > end) matches = false;
      }
    }
    
    return matches;
  });

  // Calculate work sessions and total hours
  const workSessions = useMemo(() => {
    return calculateWorkSessions(filteredLogs);
  }, [filteredLogs]);

  const workSummary = useMemo(() => {
    return calculateTotalHours(workSessions);
  }, [workSessions]);

  const handleDownload = () => {
    if (filteredLogs.length === 0) return;
    
    downloadTimeLogsPDF(filteredLogs, {
      firstName: userInfo?.firstName || 'Employee',
      lastName: userInfo?.lastName || 'Records',
      employeeId: employeeId || 'All'
    });
  };

  return (
    <div className="space-y-6 slide-in">
      <div className="card-glass rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
          <i className="fas fa-table mr-2"></i>
          My Timesheet
        </h2>
        
        {/* Work Summary Stats */}
        {workSessions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-300">{workSummary.formattedTime}</div>
              <div className="text-sm text-white/70">Total Hours</div>
            </div>
            <div className="glass-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-300">{workSummary.completedSessions}</div>
              <div className="text-sm text-white/70">Complete Sessions</div>
            </div>
            <div className="glass-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-300">{workSummary.incompleteSessions}</div>
              <div className="text-sm text-white/70">Incomplete Sessions</div>
            </div>
            <div className="glass-light rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-300">{filteredLogs.length}</div>
              <div className="text-sm text-white/70">Total Records</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-light rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full input-glass rounded-lg p-3 transition-all duration-300"
                placeholder="Enter Employee ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full input-glass rounded-lg p-3 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full input-glass rounded-lg p-3 transition-all duration-300"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
            <p className="text-sm text-white/70">
              Showing {filteredLogs.length} records
              {employeeId && ` for Employee ID: ${employeeId}`}
              {(startDate || endDate) && ` from ${startDate || 'beginning'} to ${endDate || 'end'}`}
            </p>
            <button
              onClick={handleDownload}
              disabled={filteredLogs.length === 0}
              className="btn-glass text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-300"
            >
              <i className="fas fa-download"></i>
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Work Sessions View */}
        {workSessions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-business-time mr-2"></i>
              Work Sessions
            </h3>
            <div className="space-y-3">
              {workSessions.map((session, index) => (
                <div key={index} className={`glass-light rounded-lg p-4 flex items-center justify-between ${
                  !session.isComplete ? 'border-l-4 border-yellow-400' : ''
                }`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      session.isComplete ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></div>
                    <div>
                      <div className="text-white font-medium">
                        {new Date(session.checkIn.rawTimestamp).toLocaleDateString()}
                      </div>
                      <div className="text-white/70 text-sm">
                        {new Date(session.checkIn.rawTimestamp).toLocaleTimeString()} - 
                        {session.checkOut ? new Date(session.checkOut.rawTimestamp).toLocaleTimeString() : ' (In Progress)'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {session.duration ? formatDuration(session.duration) : 'In Progress'}
                    </div>
                    <div className="text-white/60 text-sm">
                      {session.isComplete ? 'Complete' : 'Incomplete'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timesheet Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full glass-light rounded-lg overflow-hidden">
            <thead className="glass">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:glass-light transition-all duration-300">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium text-white">
                          {log.firstName} {log.lastName}
                        </div>
                        <div className="text-white/60">ID: {log.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.action === 'IN' 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                      {log.timestamp || new Date(log.rawTimestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white/70">
                      {log.deviceName || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-white/70">
                      {log.latitude && log.longitude 
                        ? `${parseFloat(log.latitude).toFixed(4)}, ${parseFloat(log.longitude).toFixed(4)}`
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-white/70">
                    <div className="flex flex-col items-center space-y-2">
                      <i className="fas fa-file-alt text-2xl"></i>
                      <span>No timesheet records found for the selected criteria.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimesheetPanel;
