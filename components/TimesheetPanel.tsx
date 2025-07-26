import React from 'react';

interface TimesheetPanelProps {
  logs: any[];
  userInfo: any;
}

const TimesheetPanel: React.FC<TimesheetPanelProps> = ({ logs, userInfo }) => {
  return (
    <div className="space-y-6 slide-in">
      {/* Hero Section */}
      <section className="bg-csea-yellow p-6 rounded-lg -mx-6 mb-6">
        <h2 className="text-xl font-bold text-csea-navy mb-2">Timesheet Documents</h2>
        <p className="text-csea-navy">View your time logs, generate reports, and download your timesheets.</p>
      </section>

      {/* Summary Card */}
      <section className="bg-csea-navy text-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-csea-yellow">Weekly Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-csea-yellow">40.5</div>
            <div className="text-sm">Hours This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-csea-yellow">5</div>
            <div className="text-sm">Days Worked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-csea-yellow">2</div>
            <div className="text-sm">Break Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-csea-yellow">100%</div>
            <div className="text-sm">Attendance</div>
          </div>
        </div>
      </section>

      {/* Time Logs Card */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-csea-navy">Recent Time Logs</h3>
        {logs && logs.length > 0 ? (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-csea-light-gray rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-csea-yellow rounded-full flex items-center justify-center">
                    <span className="text-csea-navy font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-csea-navy">{log.date || 'Today'}</div>
                    <div className="text-sm text-csea-medium-gray">{log.action || 'Check In/Out'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-csea-navy">{log.hours || '8.0'}h</div>
                  <div className="text-sm text-csea-medium-gray">{log.status || 'Completed'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-csea-light-gray rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-csea-medium-gray text-2xl">📄</span>
            </div>
            <p className="text-csea-medium-gray">No time logs available yet.</p>
            <p className="text-sm text-csea-medium-gray mt-1">Start tracking your time to see entries here.</p>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-csea-navy">Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-csea-yellow hover:bg-yellow-400 text-csea-navy py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center">
            <span className="mr-2">📊</span>
            Generate Report
          </button>
          <button className="bg-csea-navy hover:bg-blue-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center">
            <span className="mr-2">📧</span>
            Email Timesheet
          </button>
        </div>
      </section>
    </div>
  );
};

export default TimesheetPanel;
