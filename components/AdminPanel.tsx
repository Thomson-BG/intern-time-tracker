import React, { useState, useEffect } from 'react';

interface AdminPanelProps {
  logs: any[];
  absences: any[];
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ logs, absences, onLogout }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeId, setEmployeeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, we would fetch data from an API
  const refreshData = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    // Initial data load simulation
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleDownload = (type: string, format: string) => {
    console.log(`Downloading ${type} in ${format} format`);
    alert(`Download started for ${type} in ${format} format`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <div className="space-x-2">
          <button 
            onClick={refreshData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
            disabled={isLoading}
          >
            <span className="mr-2">⟳</span> Refresh Data
          </button>
          <button 
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Filters */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Data Filters</h3>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Filter by Date (Time Logs)</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">Filter by Employee ID (All Logs)</label>
            <input 
              type="text" 
              value={employeeId} 
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Enter Employee ID"
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        {/* Download Options */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Download Options</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleDownload('Time Logs', 'CSV')}
              className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded flex items-center justify-center"
            >
              <span className="mr-2">📄</span> Time Logs CSV
            </button>
            <button 
              onClick={() => handleDownload('Time Logs', 'PDF')}
              className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded flex items-center justify-center"
            >
              <span className="mr-2">📄</span> Time Logs PDF
            </button>
            <button 
              onClick={() => handleDownload('Time Logs', 'HTML')}
              className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded flex items-center justify-center"
            >
              <span className="mr-2">📄</span> Time Logs HTML
            </button>
            <button 
              onClick={() => handleDownload('Absence', 'CSV')}
              className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded flex items-center justify-center"
            >
              <span className="mr-2">📄</span> Absence CSV
            </button>
            <button 
              onClick={() => handleDownload('Absence', 'PDF')}
              className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded flex items-center justify-center"
            >
              <span className="mr-2">📄</span> Absence PDF
            </button>
            <button 
              onClick={() => handleDownload('Absence', 'HTML')}
              className="bg-gray-400 hover:bg-gray-500 text-white p-2 rounded flex items-center justify-center"
            >
              <span className="mr-2">📄</span> Absence HTML
            </button>
          </div>
        </div>
      </div>

      {/* Time Records */}
      <div>
        <h3 className="font-semibold mb-3">Time Records for {date}</h3>
        {isLoading ? (
          <div className="p-4 bg-blue-50 text-blue-600 rounded">Loading time records...</div>
        ) : (
          <div className="bg-red-50 text-red-500 p-4 rounded flex items-center">
            <span className="mr-2">⚠️</span> 
            <div>
              <strong>Error Loading Time Logs</strong>
              <div className="text-sm">Failed to fetch</div>
            </div>
          </div>
        )}
      </div>

      {/* Absence Records */}
      <div>
        <h3 className="font-semibold mb-3">Absence Records</h3>
        {isLoading ? (
          <div className="p-4 bg-blue-50 text-blue-600 rounded">Loading absence records...</div>
        ) : (
          <div className="bg-red-50 text-red-500 p-4 rounded flex items-center">
            <span className="mr-2">⚠️</span>
            <div>
              <strong>Error Loading Absence Logs</strong>
              <div className="text-sm">Failed to fetch</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
