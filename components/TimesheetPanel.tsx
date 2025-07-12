import React from 'react';

interface TimesheetPanelProps {
  logs: any[];
  userInfo: any;
}

const TimesheetPanel: React.FC<TimesheetPanelProps> = ({ logs, userInfo }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="glass-card p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-file-alt text-purple-400"></i>
          My Timesheet
        </h2>
        <div className="text-center py-8">
          <i className="fas fa-clock text-gray-500 text-4xl mb-4"></i>
          <p className="text-gray-400">No time entries found.</p>
          <p className="text-gray-500 text-sm mt-2">Start tracking your time to see entries here.</p>
        </div>
      </div>
    );
  }

  const totalHours = logs.reduce((acc, log) => {
    // Simple calculation - in a real app you'd calculate actual hours worked
    return acc + (log.action === 'IN' ? 1 : 0);
  }, 0);

  return (
    <div className="glass-card p-6 rounded-lg border border-white/10">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <i className="fas fa-file-alt text-purple-400"></i>
        My Timesheet
      </h2>
      
      <div className="glass p-4 rounded-lg border border-white/20 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-purple-400">{logs.length}</p>
            <p className="text-gray-300 text-sm">Total Entries</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{Math.floor(totalHours / 2)}</p>
            <p className="text-gray-300 text-sm">Days Worked</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{totalHours * 8}</p>
            <p className="text-gray-300 text-sm">Estimated Hours</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index} className="glass p-3 rounded border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-block w-3 h-3 rounded-full ${
                  log.action === 'IN' ? 'bg-green-400' : 'bg-red-400'
                }`}></span>
                <span className="text-white font-medium">
                  {log.action === 'IN' ? 'Check In' : 'Check Out'}
                </span>
              </div>
              <div className="text-gray-300 text-sm">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimesheetPanel;
