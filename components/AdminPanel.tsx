import React, { useState, useMemo } from 'react';
import { TimeLog, AbsenceLog } from '../types';
import { 
    downloadTimeLogsCSV, downloadTimeLogsPDF, downloadTimeLogsHTML,
    downloadAbsencesCSV, downloadAbsencesPDF, downloadAbsencesHTML 
} from '../utils/downloadHelpers';

interface AdminPanelProps {
  logs: TimeLog[];
  absences: AbsenceLog[];
  onLogout: () => void;
}

// --- Reusable Components for this Panel ---

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-800 mb-3">{children}</h3>
);

interface DownloadButtonProps {
    onClick: () => void;
    text: string;
    color: string;
    icon: string;
    disabled?: boolean;
}
const DownloadButton: React.FC<DownloadButtonProps> = ({ onClick, text, color, icon, disabled }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`bg-${color}-600 hover:bg-${color}-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed`}
    >
      <i className={`fas ${icon}`}></i>
      {text}
    </button>
  );


// --- Main Admin Panel Component ---

const AdminPanel: React.FC<AdminPanelProps> = ({ logs, absences, onLogout }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
        if (!startDate && !endDate) return true;
        const logDate = new Date(log.rawTimestamp);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if(start) start.setHours(0, 0, 0, 0);
        if(end) end.setHours(23, 59, 59, 999);
        
        if (start && logDate < start) return false;
        if (end && logDate > end) return false;
        return true;
    });
  }, [logs, startDate, endDate]);

  const filteredAbsences = useMemo(() => {
    return absences.filter(absence => {
        if (!startDate && !endDate) return true;
        // Absence date is 'YYYY-MM-DD' so we need to create date objects that can be compared
        const absenceDate = new Date(absence.date + "T00:00:00");
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if(start) start.setHours(0, 0, 0, 0);
        if(end) end.setHours(23, 59, 59, 999);

        if (start && absenceDate < start) return false;
        if (end && absenceDate > end) return false;
        return true;
    });
  }, [absences, startDate, endDate]);

  const sortedLogs = [...filteredLogs].sort((a, b) => b.rawTimestamp - a.rawTimestamp);
  const totalIn = filteredLogs.filter(l => l.action === 'IN').length;
  const totalOut = filteredLogs.filter(l => l.action === 'OUT').length;

  const getAdminPrefix = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `Admin_${date}_${time}`;
  };

  return (
    <div className="mt-8 border-t pt-6 slide-in space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
        <button onClick={onLogout} className="text-sm font-medium text-blue-600 hover:text-blue-800 transition duration-300">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardTitle>Summary</CardTitle>
            <div className="flex flex-wrap gap-2 text-sm">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">Check-ins: {totalIn}</span>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full font-medium">Check-outs: {totalOut}</span>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">Absences: {filteredAbsences.length}</span>
            </div>
        </Card>
        
        <Card>
            <CardTitle>Filter by Date</CardTitle>
            <div className="flex items-center gap-2">
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm" />
                <span>to</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-sm" />
            </div>
             {(startDate || endDate) && (
                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                    Clear Filter
                </button>
            )}
        </Card>
      </div>

      <Card>
          <CardTitle>Export Records</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Time Logs ({filteredLogs.length})</h4>
                  <div className="flex flex-wrap gap-2">
                      <DownloadButton onClick={() => downloadTimeLogsCSV(filteredLogs, getAdminPrefix())} text="CSV" color="blue" icon="fa-file-csv" disabled={filteredLogs.length === 0} />
                      <DownloadButton onClick={() => downloadTimeLogsPDF(filteredLogs, 'Time Logs', getAdminPrefix())} text="PDF" color="red" icon="fa-file-pdf" disabled={filteredLogs.length === 0}/>
                      <DownloadButton onClick={() => downloadTimeLogsHTML(filteredLogs, getAdminPrefix())} text="HTML" color="green" icon="fa-file-code" disabled={filteredLogs.length === 0}/>
                  </div>
              </div>
              <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Absence Logs ({filteredAbsences.length})</h4>
                  <div className="flex flex-wrap gap-2">
                      <DownloadButton onClick={() => downloadAbsencesCSV(filteredAbsences, getAdminPrefix())} text="CSV" color="blue" icon="fa-file-csv" disabled={filteredAbsences.length === 0}/>
                      <DownloadButton onClick={() => downloadAbsencesPDF(filteredAbsences, 'Absence Logs', getAdminPrefix())} text="PDF" color="red" icon="fa-file-pdf" disabled={filteredAbsences.length === 0}/>
                      <DownloadButton onClick={() => downloadAbsencesHTML(filteredAbsences, getAdminPrefix())} text="HTML" color="green" icon="fa-file-code" disabled={filteredAbsences.length === 0}/>
                  </div>
              </div>
          </div>
      </Card>


      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Time Clock Entries</h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {sortedLogs.length > 0 ? sortedLogs.map((log, index) => (
            <div key={`${log.deviceId}-${log.rawTimestamp}-${index}`} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{log.firstName} {log.lastName}</h4>
                  <p className="text-sm text-gray-600">ID: {log.employeeId}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${log.action === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {log.action}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{log.timestamp}</p>
              {log.action === 'OUT' && log.duration && (
                <p className="mt-1 text-sm font-semibold text-blue-600">
                    <i className="fas fa-stopwatch mr-1"></i>
                    Work Duration: {log.duration}
                </p>
              )}
              {log.latitude && log.longitude && (
                <div className="mt-2">
                  <iframe 
                    className="admin-map" 
                    title={`Map for ${log.firstName}`}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(log.longitude - 0.002).toFixed(6)},${(log.latitude - 0.0015).toFixed(6)},${(log.longitude + 0.002).toFixed(6)},${(log.latitude + 0.0015).toFixed(6)}&layer=mapnik&marker=${log.latitude},${log.longitude}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade">
                  </iframe>
                  <p className="mt-1 text-xs text-gray-500">
                    Location: {log.latitude.toFixed(5)}, {log.longitude.toFixed(5)} (Accuracy: {log.accuracy}m)
                  </p>
                </div>
              )}
              <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                <p>Device Name: {log.deviceName || 'N/A'}</p>
                <p className="break-all">Device ID: {log.deviceId}</p>
              </div>
            </div>
          )) : <p className="text-center text-gray-500 py-4">No time logs match the selected date range.</p>}
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Absence Records</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {filteredAbsences.length > 0 ? filteredAbsences.map((a, index) => (
            <div key={`${a.employeeId}-${a.date}-${index}`} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm">
              <p className="font-semibold text-yellow-900">{a.firstName} {a.lastName} (ID: {a.employeeId})</p>
              <p className="text-yellow-800"><span className="font-medium">Date:</span> {a.date}</p>
              <p className="text-yellow-800"><span className="font-medium">Reason:</span> {a.reason}</p>
              <p className="text-xs text-yellow-700 mt-1">Submitted: {a.submitted}</p>
            </div>
          )) : <p className="text-center text-gray-500 py-4">No absences match the selected date range.</p>}
        </div>
      </div>

    </div>
  );
};

export default AdminPanel;
