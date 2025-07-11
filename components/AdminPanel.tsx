import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TimeLog, AbsenceLog } from '../types';
import {
    downloadTimeLogsCSV, downloadTimeLogsPDF, downloadTimeLogsHTML,
    downloadAbsencesCSV, downloadAbsencesPDF, downloadAbsencesHTML
} from '../utils/downloadHelpers';

// Use Google Apps Script URL from environment variable
const SCRIPT_URL = import.meta.env.VITE_TIME_TRACKER_API as string;

interface AdminPanelProps {
    onLogout: () => void;
    // currentUserId is not required for the Google Sheets approach, but you may keep it for admin auth UI logic if desired
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
        <span>{text}</span>
    </button>
);

interface StatusDisplayProps {
    type: 'success' | 'error' | 'info';
    title: string;
    details: string;
}
const StatusDisplay: React.FC<StatusDisplayProps> = ({ type, title, details }) => {
    const colorClasses = {
        success: { bg: 'bg-green-50', border: 'border-green-300', icon: 'fa-check-circle text-green-500' },
        error: { bg: 'bg-red-50', border: 'border-red-300', icon: 'fa-times-circle text-red-500' },
        info: { bg: 'bg-blue-50', border: 'border-blue-300', icon: 'fa-info-circle text-blue-500' },
    };
    const { bg, border, icon } = colorClasses[type];

    return (
        <div className={`p-4 rounded-lg border shadow-sm mb-6 flex items-start space-x-3 slide-in ${bg} ${border}`}>
            <div className="text-2xl pt-1">
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <h3 className="font-bold text-lg text-gray-800">{title}</h3>
                <p className="text-sm text-gray-600">{details}</p>
            </div>
        </div>
    );
};


// --- MAIN ADMIN PANEL COMPONENT ---

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [absenceLogs, setAbsenceLogs] = useState<AbsenceLog[]>([]);
    const [loadingTimeLogs, setLoadingTimeLogs] = useState<boolean>(true);
    const [loadingAbsenceLogs, setLoadingAbsenceLogs] = useState<boolean>(true);
    const [errorTimeLogs, setErrorTimeLogs] = useState<string | null>(null);
    const [errorAbsenceLogs, setErrorAbsenceLogs] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [filterEmployeeId, setFilterEmployeeId] = useState<string>('');
    
    // User Management State
    const [showUserManagement, setShowUserManagement] = useState<boolean>(false);
    const [newManagerEmail, setNewManagerEmail] = useState<string>('');
    const [newManagerPassword, setNewManagerPassword] = useState<string>('');
    const [newManagerName, setNewManagerName] = useState<string>('');
    const [creatingManager, setCreatingManager] = useState<boolean>(false);

    // Fetch ALL time logs (no employeeId filter)
    const fetchTimeLogs = useCallback(async () => {
        setLoadingTimeLogs(true);
        setErrorTimeLogs(null);
        
        if (!SCRIPT_URL) {
            setErrorTimeLogs("Google Apps Script URL is not configured. Please check your environment variables.");
            setLoadingTimeLogs(false);
            return;
        }
        
        try {
            const response = await fetch(`${SCRIPT_URL}?type=timelog`);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error("Invalid data format received from Google Sheets");
            }
            
            setTimeLogs(
                data.map((row: any[]) => ({
                    firstName: row[0],
                    lastName: row[1],
                    employeeId: row[2],
                    deviceName: row[3],
                    action: row[4],
                    timestamp: row[5],
                    rawTimestamp: Number(row[6]),
                    latitude: Number(row[7]),
                    longitude: Number(row[8]),
                    accuracy: Number(row[9]),
                    deviceId: row[10],
                    userAgent: row[11],
                    duration: row[12],
                }))
            );
        } catch (error: any) {
            console.error('Error fetching time logs:', error);
            setErrorTimeLogs(`Failed to fetch time logs: ${error.message || "Unknown error"}`);
            setTimeLogs([]);
        } finally {
            setLoadingTimeLogs(false);
        }
    }, []);

    // Fetch ALL absence logs (no employeeId filter)
    const fetchAbsenceLogs = useCallback(async () => {
        setLoadingAbsenceLogs(true);
        setErrorAbsenceLogs(null);
        
        if (!SCRIPT_URL) {
            setErrorAbsenceLogs("Google Apps Script URL is not configured. Please check your environment variables.");
            setLoadingAbsenceLogs(false);
            return;
        }
        
        try {
            const response = await fetch(`${SCRIPT_URL}?type=absencelog`);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            
            if (!Array.isArray(data)) {
                throw new Error("Invalid data format received from Google Sheets");
            }
            
            setAbsenceLogs(
                data.map((row: any[], idx: number) => ({
                    firstName: row[0],
                    lastName: row[1],
                    employeeId: row[2],
                    deviceName: row[3],
                    date: row[4],
                    reason: row[5],
                    submitted: row[6],
                }))
            );
        } catch (error: any) {
            console.error('Error fetching absence logs:', error);
            setErrorAbsenceLogs(`Failed to fetch absence logs: ${error.message || "Unknown error"}`);
            setAbsenceLogs([]);
        } finally {
            setLoadingAbsenceLogs(false);
        }
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        fetchTimeLogs();
        fetchAbsenceLogs();
    }, [fetchTimeLogs, fetchAbsenceLogs]);

    // Filter time logs by date and optionally by employee ID
    const filteredTimeLogs = useMemo(() => {
        return timeLogs.filter(log => {
            const logDate = new Date(Number(log.rawTimestamp)).toISOString().split('T')[0];
            const dateMatch = logDate === selectedDate;
            const employeeIdMatch = filterEmployeeId ? (log.employeeId || '').includes(filterEmployeeId) : true;
            return dateMatch && employeeIdMatch;
        });
    }, [timeLogs, selectedDate, filterEmployeeId]);

    // Filter absence logs by employee ID
    const filteredAbsences = useMemo(() => {
        return absenceLogs.filter(abs => {
            return filterEmployeeId ? (abs.employeeId || '').includes(filterEmployeeId) : true;
        });
    }, [absenceLogs, filterEmployeeId]);

    // Create Manager Account Function
    const handleCreateManager = async () => {
        if (!newManagerEmail || !newManagerPassword || !newManagerName) {
            alert('Please fill in all fields for the new manager account.');
            return;
        }
        
        setCreatingManager(true);
        try {
            // In a real implementation, this would create a new manager account
            // For now, we'll just simulate it and show the credentials
            const managerCredentials = {
                email: newManagerEmail,
                password: newManagerPassword,
                name: newManagerName,
                role: 'manager',
                createdAt: new Date().toLocaleString()
            };
            
            // Store in localStorage for demonstration (in real app, this would be sent to backend)
            const existingManagers = JSON.parse(localStorage.getItem('managers') || '[]');
            existingManagers.push(managerCredentials);
            localStorage.setItem('managers', JSON.stringify(existingManagers));
            
            alert(`Manager account created successfully!\n\nCredentials:\nEmail: ${newManagerEmail}\nPassword: ${newManagerPassword}\n\nPlease provide these credentials to the manager.`);
            
            // Reset form
            setNewManagerEmail('');
            setNewManagerPassword('');
            setNewManagerName('');
            setShowUserManagement(false);
            
        } catch (error) {
            alert('Failed to create manager account. Please try again.');
        } finally {
            setCreatingManager(false);
        }
    };

    return (
        <div className="slide-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>

            <div className="flex justify-end mb-6 space-x-2">
                <button 
                    onClick={() => setShowUserManagement(!showUserManagement)} 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center gap-2"
                >
                    <i className="fas fa-users"></i> User Management
                </button>
                <button onClick={() => { fetchTimeLogs(); fetchAbsenceLogs(); }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center gap-2">
                    <i className="fas fa-sync-alt"></i> Refresh Data
                </button>
                <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center gap-2">
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>

            {/* User Management Section */}
            {showUserManagement && (
                <Card className="mb-6">
                    <CardTitle>User Management - Create Manager Account</CardTitle>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                                <input
                                    type="text"
                                    value={newManagerName}
                                    onChange={(e) => setNewManagerName(e.target.value)}
                                    placeholder="Enter manager's full name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    value={newManagerEmail}
                                    onChange={(e) => setNewManagerEmail(e.target.value)}
                                    placeholder="manager@company.com"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={newManagerPassword}
                                onChange={(e) => setNewManagerPassword(e.target.value)}
                                placeholder="Enter password for manager account"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowUserManagement(false)}
                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateManager}
                                disabled={creatingManager || !newManagerEmail || !newManagerPassword || !newManagerName}
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {creatingManager ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-user-plus"></i> Create Manager Account
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Data Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {loadingTimeLogs ? '...' : timeLogs.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Time Records</div>
                        <div className="text-xs text-gray-500 mt-1">From Google Sheets</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {loadingAbsenceLogs ? '...' : absenceLogs.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Absence Records</div>
                        <div className="text-xs text-gray-500 mt-1">From Google Sheets</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {loadingTimeLogs || loadingAbsenceLogs ? '...' : filteredTimeLogs.length + filteredAbsences.length}
                        </div>
                        <div className="text-sm text-gray-600">Filtered Results</div>
                        <div className="text-xs text-gray-500 mt-1">Matching current filters</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="col-span-full md:col-span-1">
                    <CardTitle>Data Filters</CardTitle>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="filterDate" className="block text-sm font-medium text-gray-700 mb-1">Filter by Date (Time Logs)</label>
                            <input
                                type="date"
                                id="filterDate"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-gray-900"
                            />
                        </div>
                        <div>
                            <label htmlFor="filterEmployeeId" className="block text-sm font-medium text-gray-700 mb-1">Filter by Employee ID (All Logs)</label>
                            <input
                                type="text"
                                id="filterEmployeeId"
                                value={filterEmployeeId}
                                onChange={e => setFilterEmployeeId(e.target.value)}
                                placeholder="Enter Employee ID"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-gray-900"
                            />
                        </div>
                    </div>
                </Card>
                <Card className="col-span-full md:col-span-1">
                    <CardTitle>Download Options</CardTitle>
                    <div className="grid grid-cols-2 gap-4">
                        <DownloadButton onClick={() => downloadTimeLogsCSV(filteredTimeLogs, `time_logs_${selectedDate}`)} text="Time Logs CSV" color="green" icon="fa-file-csv" disabled={!filteredTimeLogs.length} />
                        <DownloadButton onClick={() => downloadTimeLogsPDF(filteredTimeLogs, `Time Logs for ${selectedDate}`, `time_logs_${selectedDate}`)} text="Time Logs PDF" color="red" icon="fa-file-pdf" disabled={!filteredTimeLogs.length} />
                        <DownloadButton onClick={() => downloadTimeLogsHTML(filteredTimeLogs, `Time Logs for ${selectedDate}`, `time_logs_${selectedDate}`)} text="Time Logs HTML" color="purple" icon="fa-file-code" disabled={!filteredTimeLogs.length} />
                        <DownloadButton onClick={() => downloadAbsencesCSV(filteredAbsences, `absence_logs`)} text="Absence CSV" color="green" icon="fa-file-csv" disabled={!filteredAbsences.length} />
                        <DownloadButton onClick={() => downloadAbsencesPDF(filteredAbsences, `Absence Logs`, `absence_logs`)} text="Absence PDF" color="red" icon="fa-file-pdf" disabled={!filteredAbsences.length} />
                        <DownloadButton onClick={() => downloadAbsencesHTML(filteredAbsences, `Absence Logs`, `absence_logs`)} text="Absence HTML" color="purple" icon="fa-file-code" disabled={!filteredAbsences.length} />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Time Records for {selectedDate}</h3>
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {loadingTimeLogs ? 'Loading...' : `${filteredTimeLogs.length} records`}
                        </span>
                    </div>
                    {loadingTimeLogs && <StatusDisplay type="info" title="Loading" details="Fetching time logs from Google Sheets..." />}
                    {errorTimeLogs && <StatusDisplay type="error" title="Error Loading Time Logs" details={errorTimeLogs} />}
                    {!loadingTimeLogs && !errorTimeLogs && (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {filteredTimeLogs.length > 0 ? filteredTimeLogs.map((log, idx) => (
                                <div key={`${log.employeeId}-${log.rawTimestamp}-${log.action}-${idx}`} className={`p-3 rounded-lg border text-sm ${log.action === 'IN' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                    <p className={`font-semibold ${log.action === 'IN' ? 'text-green-900' : 'text-red-900'}`}>
                                        {log.action === 'IN' ? 'CHECK-IN' : 'CHECK-OUT'} by {log.firstName} {log.lastName} (ID: {log.employeeId})
                                    </p>
                                    <p className="text-gray-700"><span className="font-medium">Time:</span> {log.timestamp}</p>
                                    {log.duration && <p className="text-gray-700"><span className="font-medium">Duration:</span> {log.duration}</p>}
                                    {log.latitude && log.longitude && (
                                        <div className="mt-2">
                                            <div className="text-xs text-gray-600 mb-2">
                                                <p><strong>Location:</strong> {Number(log.latitude).toFixed(5)}, {Number(log.longitude).toFixed(5)} (Accuracy: {log.accuracy}m)</p>
                                            </div>
                                            {/* Mini Map */}
                                            <div className="bg-gray-100 border border-gray-300 rounded overflow-hidden">
                                                <div style={{ height: '120px', width: '100%' }}>
                                                    <iframe
                                                        width="100%"
                                                        height="120"
                                                        style={{ border: 0 }}
                                                        loading="lazy"
                                                        allowFullScreen
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                        src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO_4O0fL3wL1gs&center=${log.latitude},${log.longitude}&zoom=16&maptype=hybrid`}
                                                        title={`Location Map for ${log.action} - ${log.timestamp}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                                        <p>Device Name: {log.deviceName || 'N/A'}</p>
                                        <p className="break-all">Device ID: {log.deviceId}</p>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 py-4">No time logs match the selected date range and filters.</p>}
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">Absence Records</h3>
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                            {loadingAbsenceLogs ? 'Loading...' : `${filteredAbsences.length} records`}
                        </span>
                    </div>
                    {loadingAbsenceLogs && <StatusDisplay type="info" title="Loading" details="Fetching absence logs from Google Sheets..." />}
                    {errorAbsenceLogs && <StatusDisplay type="error" title="Error Loading Absence Logs" details={errorAbsenceLogs} />}
                    {!loadingAbsenceLogs && !errorAbsenceLogs && (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {filteredAbsences.length > 0 ? filteredAbsences.map((a, index) => (
                                <div key={`${a.employeeId}-${a.date}-${index}`} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm">
                                    <p className="font-semibold text-yellow-900">{a.firstName} {a.lastName} (ID: {a.employeeId})</p>
                                    <p className="text-yellow-800"><span className="font-medium">Date:</span> {a.date}</p>
                                    <p className="text-yellow-800"><span className="font-medium">Reason:</span> {a.reason}</p>
                                    <p className="text-xs text-gray-600 mt-1">Submitted: {a.submitted}</p>
                                </div>
                            )) : <p className="text-center text-gray-500 py-4">No absence records match the current filters.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
