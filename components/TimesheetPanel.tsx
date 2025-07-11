import React, { useState } from 'react';
import { downloadTimeLogsPDF } from '../utils/downloadHelpers';

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
      <section>
        <h2 className="text-lg font-semibold mb-3">My Timesheet</h2>
        
        {/* Filters */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Employee ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredLogs.length} records
              {employeeId && ` for Employee ID: ${employeeId}`}
              {(startDate || endDate) && ` from ${startDate || 'beginning'} to ${endDate || 'end'}`}
            </p>
            <button
              onClick={handleDownload}
              disabled={filteredLogs.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Download PDF
            </button>
          </div>
        </div>

        {/* Timesheet Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Device
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {log.firstName} {log.lastName}
                        </div>
                        <div className="text-gray-500">ID: {log.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.action === 'IN' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {log.timestamp || new Date(log.rawTimestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {log.deviceName || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {log.latitude && log.longitude 
                        ? `${parseFloat(log.latitude).toFixed(4)}, ${parseFloat(log.longitude).toFixed(4)}`
                        : 'N/A'
                      }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No timesheet records found for the selected criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default TimesheetPanel;
