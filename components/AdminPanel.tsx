import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TimeLog, AbsenceLog } from '../types';
import {
    downloadTimeLogsCSV, downloadTimeLogsPDF, downloadTimeLogsHTML,
    downloadAbsencesCSV, downloadAbsencesPDF, downloadAbsencesHTML
} from '../utils/downloadHelpers';
import { calculateWorkSummary, calculateDailyActivity, exportWorkSummaryCSV, WorkSummary, DailyActivity } from '../utils/analyticsHelpers';
import { calculateProductivityMetrics, analyzeWorkPatterns, exportProductivityCSV, ProductivityMetrics, WorkPattern } from '../utils/productivityHelpers';
import { createCredential, getAllCredentials, deactivateCredential, AdminCredential } from '../utils/adminCredentialsApi';

// Use Apps Script URL from environment variable
const SCRIPT_URL = import.meta.env.VITE_TIME_TRACKER_API as string;

interface AdminPanelProps {
    onLogout: () => void;
    userRole?: 'Admin' | 'Manager' | null;
    userInfo?: { fullName?: string; email?: string } | null;
}

// --- Reusable Components for this Panel ---

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`card-glass rounded-lg p-4 border border-white/20 ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-semibold text-white mb-3">{children}</h3>
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
        className={`btn-glass hover:glass-light text-white font-bold py-2 px-4 rounded-md text-sm transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
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
        success: { bg: 'status-success', icon: 'fa-check-circle text-green-300' },
        error: { bg: 'status-error', icon: 'fa-times-circle text-red-300' },
        info: { bg: 'status-info', icon: 'fa-info-circle text-blue-300' },
    };
    const { bg, icon } = colorClasses[type];

    return (
        <div className={`p-4 rounded-lg shadow-lg mb-6 flex items-start space-x-3 slide-in ${bg}`}>
            <div className="text-2xl pt-1">
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <h3 className="font-bold text-lg text-white">{title}</h3>
                <p className="text-sm text-white/80">{details}</p>
            </div>
        </div>
    );
};


// --- MAIN ADMIN PANEL COMPONENT ---

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, userRole = 'Admin', userInfo }) => {
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [absenceLogs, setAbsenceLogs] = useState<AbsenceLog[]>([]);
    const [loadingTimeLogs, setLoadingTimeLogs] = useState<boolean>(true);
    const [loadingAbsenceLogs, setLoadingAbsenceLogs] = useState<boolean>(true);
    const [errorTimeLogs, setErrorTimeLogs] = useState<string | null>(null);
    const [errorAbsenceLogs, setErrorAbsenceLogs] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [selectedEndDate, setSelectedEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [showAllDates, setShowAllDates] = useState<boolean>(true);
    const [filterEmployeeId, setFilterEmployeeId] = useState<string>('');
    
    // User Management State
    const [showUserManagement, setShowUserManagement] = useState<boolean>(false);
    const [newManagerEmail, setNewManagerEmail] = useState<string>('');
    const [newManagerPassword, setNewManagerPassword] = useState<string>('');
    const [newManagerName, setNewManagerName] = useState<string>('');
    const [newManagerLoginName, setNewManagerLoginName] = useState<string>('');
    const [creatingManager, setCreatingManager] = useState<boolean>(false);
    
    // Admin Creation State
    const [newAdminEmail, setNewAdminEmail] = useState<string>('');
    const [newAdminPassword, setNewAdminPassword] = useState<string>('');
    const [newAdminName, setNewAdminName] = useState<string>('');
    const [newAdminLoginName, setNewAdminLoginName] = useState<string>('');
    const [creatingAdmin, setCreatingAdmin] = useState<boolean>(false);
    
    // Analytics State
    const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'overview' | 'employees' | 'daily' | 'productivity'>('overview');
    const [workSummaries, setWorkSummaries] = useState<WorkSummary[]>([]);
    const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
    const [productivityMetrics, setProductivityMetrics] = useState<Map<string, ProductivityMetrics>>(new Map());
    const [workPatterns, setWorkPatterns] = useState<Map<string, WorkPattern>>(new Map());
    const [mainTab, setMainTab] = useState<'dashboard' | 'analytics' | 'management'>('dashboard');
    
    // Credential Management State  
    const [credentials, setCredentials] = useState<AdminCredential[]>([]);
    const [loadingCredentials, setLoadingCredentials] = useState<boolean>(false);
    const [errorCredentials, setErrorCredentials] = useState<string | null>(null);

    // Fetch ALL time logs (no employeeId filter)
    const fetchTimeLogs = useCallback(async () => {
        setLoadingTimeLogs(true);
        setErrorTimeLogs(null);
        
        if (!SCRIPT_URL) {
            setErrorTimeLogs("Data API URL is not configured. Please check your environment variables.");
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
                throw new Error("Invalid data format received from data source");
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
            setErrorAbsenceLogs("Data API URL is not configured. Please check your environment variables.");
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
                throw new Error("Invalid data format received from data source");
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

    // Calculate analytics when data changes
    useEffect(() => {
        if (timeLogs.length > 0) {
            const summaries = calculateWorkSummary(timeLogs);
            const dailyStats = calculateDailyActivity(timeLogs);
            const prodMetrics = calculateProductivityMetrics(timeLogs);
            const patterns = analyzeWorkPatterns(timeLogs);
            
            setWorkSummaries(summaries);
            setDailyActivities(dailyStats);
            setProductivityMetrics(prodMetrics);
            setWorkPatterns(patterns);
        }
    }, [timeLogs]);

    // Fetch data on component mount
    useEffect(() => {
        fetchTimeLogs();
        fetchAbsenceLogs();
        fetchCredentials();
    }, [fetchTimeLogs, fetchAbsenceLogs, fetchCredentials]);

    // Filter time logs by date (optional) and optionally by employee ID
    // Show all time logs by default, only filter if specifically requested
    const filteredTimeLogs = useMemo(() => {
        return timeLogs.filter(log => {
            // Apply employee ID filter if specified
            const employeeIdMatch = filterEmployeeId ? (log.employeeId || '').includes(filterEmployeeId) : true;
            
            // Apply date range filter if not showing all dates
            let dateMatch = true;
            if (!showAllDates && log.timestamp) {
                const logDate = new Date(log.timestamp).toISOString().split('T')[0];
                const startDate = selectedDate;
                const endDate = selectedEndDate;
                dateMatch = logDate >= startDate && logDate <= endDate;
            }
            
            return employeeIdMatch && dateMatch;
        });
    }, [timeLogs, filterEmployeeId, showAllDates, selectedDate, selectedEndDate]);

    // Show all absence logs by default, filter only by employee ID and date range if specified
    const filteredAbsences = useMemo(() => {
        return absenceLogs.filter(abs => {
            const employeeIdMatch = filterEmployeeId ? (abs.employeeId || '').includes(filterEmployeeId) : true;
            
            // Apply date range filter if not showing all dates
            let dateMatch = true;
            if (!showAllDates && abs.absenceDate) {
                const absenceDate = abs.absenceDate;
                const startDate = selectedDate;
                const endDate = selectedEndDate;
                dateMatch = absenceDate >= startDate && absenceDate <= endDate;
            }
            
            return employeeIdMatch && dateMatch;
        });
    }, [absenceLogs, filterEmployeeId, showAllDates, selectedDate, selectedEndDate]);

    // Fetch credentials from Google Sheets
    const fetchCredentials = useCallback(async () => {
        if (userRole !== 'Admin') return; // Only admins can view credentials
        
        setLoadingCredentials(true);
        setErrorCredentials(null);
        
        try {
            const creds = await getAllCredentials();
            setCredentials(creds);
        } catch (error: any) {
            console.error('Error fetching credentials:', error);
            setErrorCredentials(`Failed to fetch credentials: ${error.message || "Unknown error"}`);
            setCredentials([]);
        } finally {
            setLoadingCredentials(false);
        }
    }, [userRole]);

    // Create Manager Account Function
    const handleCreateManager = async () => {
        if (!newManagerEmail || !newManagerPassword || !newManagerName || !newManagerLoginName) {
            alert('Please fill in all fields for the new manager account.');
            return;
        }
        
        setCreatingManager(true);
        try {
            const managerCredential: AdminCredential = {
                fullName: newManagerName,
                email: newManagerEmail,
                loginName: newManagerLoginName,
                password: newManagerPassword,
                role: 'Manager',
                active: true
            };
            
            // Create in Google Sheets
            await createCredential(managerCredential);
            
            alert(`Manager account created successfully!\n\nCredentials:\nLogin Name: ${newManagerLoginName}\nPassword: ${newManagerPassword}\n\nPlease provide these credentials to the manager.`);
            
            // Reset form
            setNewManagerEmail('');
            setNewManagerPassword('');
            setNewManagerName('');
            setNewManagerLoginName('');
            setShowUserManagement(false);
            
            // Refresh credentials list
            fetchCredentials();
            
        } catch (error: any) {
            alert(`Failed to create manager account: ${error.message || 'Unknown error'}`);
        } finally {
            setCreatingManager(false);
        }
    };

    // Create Admin Account Function
    const handleCreateAdmin = async () => {
        if (!newAdminEmail || !newAdminPassword || !newAdminName || !newAdminLoginName) {
            alert('Please fill in all fields for the new admin account.');
            return;
        }
        
        setCreatingAdmin(true);
        try {
            const adminCredential: AdminCredential = {
                fullName: newAdminName,
                email: newAdminEmail,
                loginName: newAdminLoginName,
                password: newAdminPassword,
                role: 'Admin',
                active: true
            };
            
            // Create in Google Sheets
            await createCredential(adminCredential);
            
            alert(`Admin account created successfully!\n\nCredentials:\nLogin Name: ${newAdminLoginName}\nPassword: ${newAdminPassword}\n\nPlease provide these credentials to the admin.`);
            
            // Reset form
            setNewAdminEmail('');
            setNewAdminPassword('');
            setNewAdminName('');
            setNewAdminLoginName('');
            
            // Refresh credentials list
            fetchCredentials();
            
        } catch (error: any) {
            alert(`Failed to create admin account: ${error.message || 'Unknown error'}`);
        } finally {
            setCreatingAdmin(false);
        }
    };

    // Delete credential function
    const handleDeleteCredential = async (loginName: string) => {
        if (!confirm(`Are you sure you want to delete the account for ${loginName}? This action cannot be undone.`)) {
            return;
        }
        
        try {
            await deactivateCredential(loginName);
            alert('Account has been successfully deactivated.');
            
            // Refresh credentials list
            fetchCredentials();
        } catch (error: any) {
            alert(`Failed to delete account: ${error.message || 'Unknown error'}`);
        }
    };

    return (
        <div className="slide-in">
            <h2 className="text-2xl font-bold text-white mb-6">
                {userRole === 'Admin' ? 'Admin Panel' : 'Manager Panel'}
                {userInfo?.fullName && (
                    <span className="text-sm text-white/70 ml-2">
                        - Welcome, {userInfo.fullName}
                    </span>
                )}
            </h2>

            <div className="flex justify-end mb-6 space-x-2">
                {/* User Management - Only visible to Admins */}
                {userRole === 'Admin' && (
                    <button 
                        onClick={() => setShowUserManagement(!showUserManagement)} 
                        className="btn-glass text-white font-bold py-2 px-4 rounded-md text-sm transition-all duration-300 flex items-center gap-2"
                    >
                        <i className="fas fa-users"></i> User Management
                    </button>
                )}
                <button onClick={() => { fetchTimeLogs(); fetchAbsenceLogs(); fetchCredentials(); }} className="btn-glass text-white font-bold py-2 px-4 rounded-md text-sm transition-all duration-300 flex items-center gap-2">
                    <i className="fas fa-sync-alt"></i> Refresh Data
                </button>
                <button onClick={onLogout} className="btn-glass text-white font-bold py-2 px-4 rounded-md text-sm transition-all duration-300 flex items-center gap-2 hover:bg-red-500/20">
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-2 mb-6">
                <button
                    onClick={() => setMainTab('dashboard')}
                    className={`py-3 px-6 font-semibold rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                        mainTab === 'dashboard'
                            ? 'glass-light text-white border-white/30 shadow-lg transform scale-105'
                            : 'glass text-white/70 hover:text-white hover:glass-light'
                    }`}
                >
                    <i className="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </button>
                <button
                    onClick={() => setMainTab('analytics')}
                    className={`py-3 px-6 font-semibold rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                        mainTab === 'analytics'
                            ? 'glass-light text-white border-white/30 shadow-lg transform scale-105'
                            : 'glass text-white/70 hover:text-white hover:glass-light'
                    }`}
                >
                    <i className="fas fa-chart-bar"></i>
                    <span>Analytics</span>
                </button>
                {/* Management tab - Only visible to Admins */}
                {userRole === 'Admin' && (
                    <button
                        onClick={() => setMainTab('management')}
                        className={`py-3 px-6 font-semibold rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                            mainTab === 'management'
                                ? 'glass-light text-white border-white/30 shadow-lg transform scale-105'
                                : 'glass text-white/70 hover:text-white hover:glass-light'
                        }`}
                    >
                        <i className="fas fa-cogs"></i>
                        <span>Management</span>
                    </button>
                )}
            </div>

            {/* Tab Content */}
            {mainTab === 'dashboard' && (
                <>
                    {/* User Management Section - Only visible to Admins */}
                    {showUserManagement && userRole === 'Admin' && (
                <div className="space-y-6">
                    <Card className="mb-6">
                        <CardTitle>User Management - Create Manager Account</CardTitle>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Manager Name</label>
                                    <input
                                        type="text"
                                        value={newManagerName}
                                        onChange={(e) => setNewManagerName(e.target.value)}
                                        placeholder="Enter manager's full name"
                                        className="w-full input-glass rounded-lg p-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={newManagerEmail}
                                        onChange={(e) => setNewManagerEmail(e.target.value)}
                                        placeholder="manager@company.com"
                                        className="w-full input-glass rounded-lg p-3"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Login Name</label>
                                    <input
                                        type="text"
                                        value={newManagerLoginName}
                                        onChange={(e) => setNewManagerLoginName(e.target.value)}
                                        placeholder="Enter login username"
                                        className="w-full input-glass rounded-lg p-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={newManagerPassword}
                                        onChange={(e) => setNewManagerPassword(e.target.value)}
                                        placeholder="Enter password for manager account"
                                        className="w-full input-glass rounded-lg p-3"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowUserManagement(false)}
                                    className="btn-glass text-white font-bold py-2 px-4 rounded-md text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateManager}
                                    disabled={creatingManager || !newManagerEmail || !newManagerPassword || !newManagerName || !newManagerLoginName}
                                    className="btn-glass hover:glass-light text-white font-bold py-2 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

                    <Card className="mb-6">
                        <CardTitle>User Management - Create Admin Account</CardTitle>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Admin Name</label>
                                    <input
                                        type="text"
                                        value={newAdminName}
                                        onChange={(e) => setNewAdminName(e.target.value)}
                                        placeholder="Enter admin's full name"
                                        className="w-full input-glass rounded-lg p-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                        placeholder="admin@company.com"
                                        className="w-full input-glass rounded-lg p-3"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Login Name</label>
                                    <input
                                        type="text"
                                        value={newAdminLoginName}
                                        onChange={(e) => setNewAdminLoginName(e.target.value)}
                                        placeholder="Enter login username"
                                        className="w-full input-glass rounded-lg p-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={newAdminPassword}
                                        onChange={(e) => setNewAdminPassword(e.target.value)}
                                        placeholder="Enter password for admin account"
                                        className="w-full input-glass rounded-lg p-3"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleCreateAdmin}
                                    disabled={creatingAdmin || !newAdminEmail || !newAdminPassword || !newAdminName || !newAdminLoginName}
                                    className="btn-glass hover:glass-light text-white font-bold py-2 px-4 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {creatingAdmin ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i> Creating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-user-shield"></i> Create Admin Account
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Data Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                            {loadingTimeLogs ? '...' : timeLogs.length}
                        </div>
                        <div className="text-sm text-white">Total Time Records</div>
                        <div className="text-xs text-white/70 mt-1">From data source</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">
                            {loadingAbsenceLogs ? '...' : absenceLogs.length}
                        </div>
                        <div className="text-sm text-white">Total Absence Records</div>
                        <div className="text-xs text-white/70 mt-1">From data source</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                            {loadingTimeLogs || loadingAbsenceLogs ? '...' : filteredTimeLogs.length + filteredAbsences.length}
                        </div>
                        <div className="text-sm text-white">Filtered Results</div>
                        <div className="text-xs text-white/70 mt-1">Matching current filters</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="col-span-full md:col-span-1">
                    <CardTitle>Data Filters</CardTitle>
                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="showAllDates"
                                    checked={showAllDates}
                                    onChange={(e) => setShowAllDates(e.target.checked)}
                                    className="text-blue-500"
                                />
                                <label htmlFor="showAllDates" className="text-sm font-medium text-white">Show All Dates</label>
                            </div>
                        </div>
                        {!showAllDates && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="filterDate" className="block text-sm font-medium text-white mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        id="filterDate"
                                        value={selectedDate}
                                        onChange={e => setSelectedDate(e.target.value)}
                                        className="w-full input-glass rounded-lg p-3"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="filterEndDate" className="block text-sm font-medium text-white mb-1">End Date</label>
                                    <input
                                        type="date"
                                        id="filterEndDate"
                                        value={selectedEndDate}
                                        onChange={e => setSelectedEndDate(e.target.value)}
                                        className="w-full input-glass rounded-lg p-3"
                                    />
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="filterEmployeeId" className="block text-sm font-medium text-white mb-1">Filter by Employee ID (All Logs)</label>
                            <input
                                type="text"
                                id="filterEmployeeId"
                                value={filterEmployeeId}
                                onChange={e => setFilterEmployeeId(e.target.value)}
                                placeholder="Enter Employee ID"
                                className="w-full input-glass rounded-lg p-3"
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
                        <h3 className="text-xl font-semibold text-white">All Time Records</h3>
                        <span className="text-sm text-white/70 glass-light px-3 py-1 rounded-full">
                            {loadingTimeLogs ? 'Loading...' : `${filteredTimeLogs.length} records`}
                        </span>
                    </div>
                    {loadingTimeLogs && <StatusDisplay type="info" title="Loading" details="Fetching time logs from data source..." />}
                    {errorTimeLogs && <StatusDisplay type="error" title="Error Loading Time Logs" details={errorTimeLogs} />}
                    {!loadingTimeLogs && !errorTimeLogs && (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {filteredTimeLogs.length > 0 ? filteredTimeLogs.map((log, idx) => (
                                <div key={`${log.employeeId}-${log.rawTimestamp}-${log.action}-${idx}`} className={`glass-light p-3 rounded-lg border border-white/20 text-sm`}>
                                    <p className={`font-semibold ${log.action === 'IN' ? 'text-green-400' : 'text-red-400'}`}>
                                        {log.action === 'IN' ? 'CHECK-IN' : 'CHECK-OUT'} by {log.firstName} {log.lastName} (ID: {log.employeeId})
                                    </p>
                                    <p className="text-white"><span className="font-medium">Time:</span> {log.timestamp}</p>
                                    {log.duration && <p className="text-white"><span className="font-medium">Duration:</span> {log.duration}</p>}
                                    {log.latitude && log.longitude && (
                                        <div className="mt-2">
                                            <div className="text-xs text-white/80 mb-2">
                                                <p><strong>Location:</strong> {Number(log.latitude).toFixed(5)}, {Number(log.longitude).toFixed(5)} (Accuracy: {log.accuracy}m)</p>
                                            </div>
                                            {/* Mini Map with OpenStreetMap */}
                                            <div className="glass border border-white/20 rounded overflow-hidden">
                                                <div style={{ height: '120px', width: '100%' }}>
                                                    <iframe
                                                        width="100%"
                                                        height="120"
                                                        style={{ border: 0 }}
                                                        loading="lazy"
                                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${log.longitude-0.005},${log.latitude-0.005},${log.longitude+0.005},${log.latitude+0.005}&layer=mapnik&marker=${log.latitude},${log.longitude}`}
                                                        title={`Location Map for ${log.action} - ${log.timestamp}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-2 text-xs text-white/70 border-t border-white/20 pt-2">
                                        <p>Device Name: {log.deviceName || 'N/A'}</p>
                                        <p className="break-all">Device ID: {log.deviceId}</p>
                                    </div>
                                </div>
                            )) : <p className="text-center text-white/70 py-4">No time logs match the selected date range and filters.</p>}
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">All Absence Records</h3>
                        <span className="text-sm text-white/70 glass-light px-3 py-1 rounded-full">
                            {loadingAbsenceLogs ? 'Loading...' : `${filteredAbsences.length} records`}
                        </span>
                    </div>
                    {loadingAbsenceLogs && <StatusDisplay type="info" title="Loading" details="Fetching absence logs from data source..." />}
                    {errorAbsenceLogs && <StatusDisplay type="error" title="Error Loading Absence Logs" details={errorAbsenceLogs} />}
                    {!loadingAbsenceLogs && !errorAbsenceLogs && (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {filteredAbsences.length > 0 ? filteredAbsences.map((a, index) => (
                                <div key={`${a.employeeId}-${a.date}-${index}`} className="glass-light p-3 rounded-lg border border-white/20 text-sm">
                                    <p className="font-semibold text-yellow-400">{a.firstName} {a.lastName} (ID: {a.employeeId})</p>
                                    <p className="text-white"><span className="font-medium">Date:</span> {a.date}</p>
                                    <p className="text-white"><span className="font-medium">Reason:</span> {a.reason}</p>
                                    <p className="text-xs text-white/70 mt-1">Submitted: {a.submitted}</p>
                                </div>
                            )) : <p className="text-center text-white/70 py-4">No absence records match the current filters.</p>}
                        </div>
                    )}
                </div>
            </div>
                </>
            )}

            {/* Analytics Tab */}
            {mainTab === 'analytics' && (
                <div className="space-y-6">
                    <Card>
                        <CardTitle>Work Analytics Dashboard</CardTitle>
                        
                        {/* Analytics Sub-tabs */}
                        <div className="flex space-x-2 mb-6">
                            <button
                                onClick={() => setActiveAnalyticsTab('overview')}
                                className={`py-2 px-4 rounded-lg text-sm transition-all duration-300 ${
                                    activeAnalyticsTab === 'overview'
                                        ? 'glass-light text-white'
                                        : 'glass text-white/70 hover:text-white'
                                }`}
                            >
                                Overview
                            </button>
                            <button
                                onClick={() => setActiveAnalyticsTab('employees')}
                                className={`py-2 px-4 rounded-lg text-sm transition-all duration-300 ${
                                    activeAnalyticsTab === 'employees'
                                        ? 'glass-light text-white'
                                        : 'glass text-white/70 hover:text-white'
                                }`}
                            >
                                Employee Summary
                            </button>
                            <button
                                onClick={() => setActiveAnalyticsTab('daily')}
                                className={`py-2 px-4 rounded-lg text-sm transition-all duration-300 ${
                                    activeAnalyticsTab === 'daily'
                                        ? 'glass-light text-white'
                                        : 'glass text-white/70 hover:text-white'
                                }`}
                            >
                                Daily Activity
                            </button>
                            <button
                                onClick={() => setActiveAnalyticsTab('productivity')}
                                className={`py-2 px-4 rounded-lg text-sm transition-all duration-300 ${
                                    activeAnalyticsTab === 'productivity'
                                        ? 'glass-light text-white'
                                        : 'glass text-white/70 hover:text-white'
                                }`}
                            >
                                Productivity
                            </button>
                        </div>

                        {/* Analytics Content */}
                        {activeAnalyticsTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center glass-light p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-400">{workSummaries.length}</div>
                                    <div className="text-sm text-white">Active Employees</div>
                                </div>
                                <div className="text-center glass-light p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-400">
                                        {workSummaries.reduce((total, emp) => total + emp.totalHours, 0)}
                                    </div>
                                    <div className="text-sm text-white">Total Hours Logged</div>
                                </div>
                                <div className="text-center glass-light p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-yellow-400">{dailyActivities.length}</div>
                                    <div className="text-sm text-white">Days with Activity</div>
                                </div>
                            </div>
                        )}

                        {activeAnalyticsTab === 'employees' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-semibold text-white">Employee Work Summary</h4>
                                    <button
                                        onClick={() => exportWorkSummaryCSV(workSummaries)}
                                        className="btn-glass text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                                        disabled={workSummaries.length === 0}
                                    >
                                        <i className="fas fa-download"></i>
                                        Export CSV
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {workSummaries.map((summary, index) => (
                                        <div key={summary.employeeId} className="glass-light p-4 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-semibold text-white">{summary.name}</h5>
                                                    <p className="text-sm text-white/70">ID: {summary.employeeId}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-blue-400">{summary.totalHours}h</div>
                                                    <div className="text-xs text-white/70">{summary.totalDays} days</div>
                                                </div>
                                            </div>
                                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-white/70">Check-ins:</span>
                                                    <span className="text-green-400 ml-2">{summary.checkIns}</span>
                                                </div>
                                                <div>
                                                    <span className="text-white/70">Check-outs:</span>
                                                    <span className="text-red-400 ml-2">{summary.checkOuts}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeAnalyticsTab === 'daily' && (
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-white">Daily Activity Overview</h4>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {dailyActivities.slice(0, 30).map((activity, index) => (
                                        <div key={activity.date} className="glass-light p-4 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-semibold text-white">{activity.date}</div>
                                                    <div className="text-sm text-white/70">{activity.employees.size} employees active</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-white">
                                                        <span className="text-green-400">{activity.checkIns} in</span>
                                                        <span className="mx-2">•</span>
                                                        <span className="text-red-400">{activity.checkOuts} out</span>
                                                    </div>
                                                    <div className="text-xs text-white/70">{activity.totalHours}h estimated</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeAnalyticsTab === 'productivity' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-semibold text-white">Productivity Analysis</h4>
                                    <button
                                        onClick={() => exportProductivityCSV(productivityMetrics, timeLogs)}
                                        className="btn-glass text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                                        disabled={productivityMetrics.size === 0}
                                    >
                                        <i className="fas fa-download"></i>
                                        Export Productivity Report
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {Array.from(productivityMetrics.entries()).map(([employeeId, metrics]) => {
                                        const pattern = workPatterns.get(employeeId);
                                        const employee = timeLogs.find(log => log.employeeId === employeeId);
                                        
                                        return (
                                            <div key={employeeId} className="glass-light p-4 rounded-lg">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h5 className="font-semibold text-white">
                                                            {employee?.firstName} {employee?.lastName}
                                                        </h5>
                                                        <p className="text-sm text-white/70">ID: {employeeId}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-2xl font-bold ${
                                                            metrics.overallScore >= 80 ? 'text-green-400' :
                                                            metrics.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                                                        }`}>
                                                            {metrics.overallScore}%
                                                        </div>
                                                        <div className="text-xs text-white/70">Overall Score</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-3 gap-4 mb-3">
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-blue-400">{metrics.efficiency}%</div>
                                                        <div className="text-xs text-white/70">Efficiency</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-green-400">{metrics.punctuality}%</div>
                                                        <div className="text-xs text-white/70">Punctuality</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-lg font-semibold text-yellow-400">{metrics.consistency}%</div>
                                                        <div className="text-xs text-white/70">Consistency</div>
                                                    </div>
                                                </div>
                                                
                                                {pattern && (
                                                    <div className="border-t border-white/20 pt-3">
                                                        <h6 className="text-sm font-medium text-white mb-2">Work Pattern</h6>
                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <span className="text-white/70">Preferred Hours:</span>
                                                                <span className="text-white ml-2">
                                                                    {pattern.preferredStartTime} - {pattern.preferredEndTime}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-white/70">Avg Duration:</span>
                                                                <span className="text-white ml-2">{pattern.averageWorkDuration}h</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-white/70">Most Active:</span>
                                                                <span className="text-green-400 ml-2">{pattern.mostActiveDay}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-white/70">Least Active:</span>
                                                                <span className="text-red-400 ml-2">{pattern.leastActiveDay}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {productivityMetrics.size === 0 && (
                                        <div className="text-center text-white/70 py-8">
                                            No productivity data available. Check in/out data needed for analysis.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}

            {/* Management Tab - Only visible to Admins */}
            {mainTab === 'management' && userRole === 'Admin' && (
                <div className="space-y-6">
                    <Card>
                        <CardTitle>Account Management</CardTitle>
                        
                        {loadingCredentials && (
                            <div className="text-center py-4">
                                <i className="fas fa-spinner fa-spin text-white mr-2"></i>
                                <span className="text-white">Loading accounts...</span>
                            </div>
                        )}
                        
                        {errorCredentials && (
                            <div className="status-error rounded-lg p-4 mb-4">
                                <div className="flex items-center space-x-2">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    <span className="text-white font-medium">{errorCredentials}</span>
                                </div>
                            </div>
                        )}
                        
                        {!loadingCredentials && !errorCredentials && (
                            <div className="space-y-6">
                                {/* Admin Accounts Section */}
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <i className="fas fa-user-shield mr-2"></i>
                                        Admin Accounts
                                    </h4>
                                    <div className="space-y-3">
                                        {credentials.filter(cred => cred.role === 'Admin').map((admin, index) => (
                                            <div key={index} className="glass-light p-4 rounded-lg flex justify-between items-center">
                                                <div>
                                                    <div className="text-white font-medium">{admin.fullName}</div>
                                                    <div className="text-white/70 text-sm">{admin.email}</div>
                                                    <div className="text-white/70 text-sm">Login: {admin.loginName}</div>
                                                    <div className="text-xs text-white/50">
                                                        Status: {admin.active ? 'Active' : 'Inactive'}
                                                    </div>
                                                </div>
                                                {admin.loginName !== 'admin' && ( // Prevent deletion of system admin
                                                    <button
                                                        onClick={() => handleDeleteCredential(admin.loginName)}
                                                        className="btn-glass hover:bg-red-500/20 text-white py-2 px-3 rounded-lg flex items-center gap-2"
                                                        title="Delete Account"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {credentials.filter(cred => cred.role === 'Admin').length === 0 && (
                                            <div className="text-white/70 text-sm glass-light p-4 rounded-lg">
                                                No admin accounts found in Google Sheets
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Manager Accounts Section */}
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <i className="fas fa-users mr-2"></i>
                                        Manager Accounts
                                    </h4>
                                    <div className="space-y-3">
                                        {credentials.filter(cred => cred.role === 'Manager').map((manager, index) => (
                                            <div key={index} className="glass-light p-4 rounded-lg flex justify-between items-center">
                                                <div>
                                                    <div className="text-white font-medium">{manager.fullName}</div>
                                                    <div className="text-white/70 text-sm">{manager.email}</div>
                                                    <div className="text-white/70 text-sm">Login: {manager.loginName}</div>
                                                    <div className="text-xs text-white/50">
                                                        Status: {manager.active ? 'Active' : 'Inactive'}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCredential(manager.loginName)}
                                                    className="btn-glass hover:bg-red-500/20 text-white py-2 px-3 rounded-lg flex items-center gap-2"
                                                    title="Delete Account"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                        {credentials.filter(cred => cred.role === 'Manager').length === 0 && (
                                            <div className="text-white/70 text-sm glass-light p-4 rounded-lg">
                                                No manager accounts found in Google Sheets
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* System Actions */}
                                <div>
                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                                        <i className="fas fa-cogs mr-2"></i>
                                        System Actions
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                fetchTimeLogs();
                                                fetchAbsenceLogs();
                                                fetchCredentials();
                                            }}
                                            className="btn-glass text-white py-3 px-4 rounded-lg flex items-center gap-2"
                                        >
                                            <i className="fas fa-sync-alt"></i>
                                            Refresh All Data
                                        </button>
                                        <button
                                            onClick={() => fetchCredentials()}
                                            className="btn-glass text-white py-3 px-4 rounded-lg flex items-center gap-2"
                                        >
                                            <i className="fas fa-users-cog"></i>
                                            Refresh Accounts
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
