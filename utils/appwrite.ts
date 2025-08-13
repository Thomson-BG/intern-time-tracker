import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Tab, TimeLog, AbsenceLog, UserInfo, LocationState } from '../types';
import AdminPanel from '../components/AdminPanel'; // Make sure this component is ready to fetch its own data
import { downloadTimeLogsPDF, downloadInternCertificatePDF } from './downloadHelpers';

// Import Appwrite services and configure
import { Client, Account, Databases, ID, Query, Permission, Role } from 'appwrite';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1')
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '686cc4ed002aec037736');

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);

// Define constants from appwrite.json
export const APPWRITE_DATABASE_ID = '686d4fff002269d3350d';
export const APPWRITE_TIMELOGS_COLLECTION_ID = 'timeLogsCollection';
export const APPWRITE_ABENCELOGS_COLLECTION_ID = 'absenceLogsCollection';

// Export Query, Permission, Role, ID for use in components
export { ID, Query, Permission, Role };

// --- HELPER FUNCTIONS ---
const getDeviceId = async () => {
    const text = navigator.userAgent + (navigator.languages.join(',')) + (new Date().getTimezoneOffset()) + (window.screen.height * window.screen.width);
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const fetchLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            reject(new Error('Geolocation is not available in your browser.'));
            return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000, // 10 seconds
            maximumAge: 0 // Don't use a cached position
        });
    });
};


// --- UI COMPONENTS (Defined outside main App component to prevent re-creation on re-renders) ---

const Header: React.FC = () => (
    <div className="bg-blue-600 p-6 text-white rounded-t-xl">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Bulldog Garage Intern Time & Absence Tracker</h1>
                <p className="text-blue-100">Record your hours, absences, and view your timesheet</p>
            </div>
            <div className="text-4xl text-blue-200">
                <i className="fas fa-clock"></i>
            </div>
        </div>
    </div>
);

interface TabBarProps {
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}
const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => (
    <div className="mb-6 flex space-x-1 border-b border-gray-200">
        {(Object.keys(Tab) as Array<keyof typeof Tab>).map((key) => {
            const tab = Tab[key];
            const isActive = activeTab === tab;
            return (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 font-bold text-sm -mb-px border-b-2 transition-colors duration-200 ${
                        isActive 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:text-blue-600 hover:border-blue-300'
                    }`}
                >
                    {tab}
                </button>
            );
        })}
    </div>
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

interface UserInfoFormProps {
    userInfo: UserInfo;
    setUserInfo: (info: UserInfo) => void;
}
const UserInfoForm: React.FC<UserInfoFormProps> = ({ userInfo, setUserInfo }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
    };

    return (
        <div className="mb-8 slide-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(userInfo).filter(k => k !== 'deviceName').map(key => (
                    <div key={key}>
                        <label htmlFor={key} className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                            {key.replace('Id', ' ID').replace('Name', ' Name')}
                        </label>
                        <input type="text" id={key} name={key} value={(userInfo as any)[key]} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder:text-gray-500" />
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-1">Device Name (e.g., My Phone, Lab PC)</label>
                <input type="text" id="deviceName" name="deviceName" value={userInfo.deviceName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder:text-gray-500" placeholder="Optional" />
            </div>
        </div>
    );
};

interface TimePanelProps {
    userInfo: UserInfo;
    setUserInfo: (info: UserInfo) => void;
    onLogAction: (action: 'IN' | 'OUT') => void;
    location: LocationState;
    isLogging: boolean;
}
const TimePanel: React.FC<TimePanelProps> = ({ userInfo, setUserInfo, onLogAction, location, isLogging }) => {

    const ActionButton: React.FC<{ action: 'IN' | 'OUT' }> = ({ action }) => {
        const isOut = action === 'OUT';
        const color = isOut ? 'red' : 'green';
        const icon = isOut ? 'fa-sign-out-alt' : 'fa-sign-in-alt';

        return (
            <button
                onClick={() => onLogAction(action)}
                disabled={isLogging}
                className={`bg-${color}-600 hover:bg-${color}-700 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-center space-x-3 transition duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100`}
            >
                {isLogging ? (
                    <>
                        <i className="fas fa-spinner fa-spin"></i>
                        <span>PROCESSING...</span>
                    </>
                ) : (
                    <>
                        <i className={`fas ${icon}`}></i>
                        <span>CHECK {action}</span>
                    </>
                )}
            </button>
        );
    };

    return (
        <div className="slide-in">
            <UserInfoForm userInfo={userInfo} setUserInfo={setUserInfo} />
            <h2 className="text-xl font-semibold mb-4 text-gray-800">2. Clock In / Out</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <ActionButton action="IN" />
                <ActionButton action="OUT" />
            </div>
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Location Information</h2>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <i className={`fas fa-map-marker-alt mr-2 ${location.error ? 'text-red-500' : 'text-green-500'}`}></i>
                        <span>{location.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                        <p>Latitude: <span className="font-mono">{location.latitude?.toFixed(5) || '-'}</span></p>
                        <p>Longitude: <span className="font-mono">{location.longitude?.toFixed(5) || '-'}</span></p>
                        <p>Accuracy: <span className="font-mono">{location.accuracy?.toFixed(0) || '-'} meters</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface AbsencePanelProps {
    userInfo: UserInfo;
    onAddAbsence: (date: string, reason: string) => void;
}
const AbsencePanel: React.FC<AbsencePanelProps> = ({ userInfo, onAddAbsence }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddAbsence(date, reason);
        setReason('');
    };

    return (
        <div className="slide-in">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Log an Absence</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-gray-50 border rounded-lg">
                <div>
                    <label htmlFor="absenceDate" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" id="absenceDate" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900" />
                </div>
                <div>
                    <label htmlFor="absenceReason" className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <input type="text" id="absenceReason" value={reason} onChange={e => setReason(e.target.value)} required maxLength={100} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900 placeholder:text-gray-500" placeholder="E.g., Sick, Family, Academic..." />
                </div>
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 transform hover:scale-105">
                    Submit Absence
                </button>
            </form>
        </div>
    );
};

interface TimesheetPanelProps {
    // logs prop removed - TimesheetPanel should fetch its own data now
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
            const response = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_TIMELOGS_COLLECTION_ID,
                [
                    Query.equal('employeeId', studentId),
                    Query.orderDesc('rawTimestamp')
                ]
            );
            const userLogs = response.documents as TimeLog[];
            setFilteredLogs(userLogs);
        } catch (error: any) {
            console.error("Error loading timesheet:", error);
            setLogError(`Failed to load timesheet: ${error.message || 'Unknown error'}`);
            setFilteredLogs([]);
        } finally {
            setLoadingLogs(false);
        }
    }, [studentId]);

    useEffect(() => {
        if(studentId) {
            loadTimesheet();
        }
    }, [studentId, loadTimesheet]); // Rerun when studentId changes

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

    const handleDownloadCertificate = () => {
        // Use userInfo for the certificate, but ensure we have the current student ID
        const certificateUserInfo = {
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            employeeId: studentId || userInfo.employeeId
        };
        downloadInternCertificatePDF(filteredLogs, certificateUserInfo);
    };

    return (
        <div className="slide-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">My Timesheet</h2>
                    <div className="flex items-center space-x-2 mt-2">
                        <label htmlFor="timesheetStudentId" className="text-sm font-medium text-gray-700">Employee ID:</label>
                        <input type="text" id="timesheetStudentId" value={studentId} onChange={e => setStudentId(e.target.value)} className="px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 text-gray-900 placeholder:text-gray-500" placeholder="Enter Employee ID" />
                        <button onClick={loadTimesheet} type="button" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm" disabled={loadingLogs}>
                            {loadingLogs ? 'Loading...' : 'Load'}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button onClick={handleDownloadPdf} disabled={!filteredLogs.length} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Download Timesheet
                    </button>
                    <button onClick={handleDownloadCertificate} disabled={!filteredLogs.length || !userInfo.firstName || !userInfo.lastName} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Download Certificate
                    </button>
                </div>
            </div>
            {logError && <StatusDisplay type="error" title="Timesheet Error" details={logError} />}
            {loadingLogs && <StatusDisplay type="info" title="Loading" details="Fetching timesheet data..." />}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
                             <tr key={`${log.$id || log.rawTimestamp}-${i}`} className="hover:bg-gray-50"> {/* Use $id if available */}
                                <td className={`px-4 py-2 whitespace-nowrap font-medium ${log.action === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{log.action}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{log.timestamp}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{log.deviceName}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{log.action === 'OUT' ? (log.duration || '') : ''}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="text-center py-4 text-gray-500">No records found for this ID.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


interface AdminLoginProps {
    onLogin: (email: string, password: string) => Promise<boolean>;
    onLoginSuccess: () => void;
    onLoginFailure: () => void;
    isLoggingIn: boolean;
}
const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onLoginSuccess, onLoginFailure, isLoggingIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await onLogin(email, password);
        if (success) {
            onLoginSuccess();
        } else {
            onLoginFailure();
        }
    };

    return (
        <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900" />
                </div>
                <button type="submit" disabled={isLoggingIn} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isLoggingIn ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [userInfo, setUserInfo] = useLocalStorage<UserInfo>('userInfo', { firstName: '', lastName: '', employeeId: '', deviceName: '' });
    // timeLogs and absenceLogs will now be fetched directly by TimesheetPanel and AdminPanel, no longer stored in App.tsx state
    // const [timeLogs, setTimeLogs] = useLocalStorage<TimeLog[]>('timeLogs', []);
    // const [absenceLogs, setAbsenceLogs] = useLocalStorage<AbsenceLog[]>('absenceLogs', []);
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Time);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentAppwriteUserId, setCurrentAppwriteUserId] = useState<string | null>(null); // State to hold current Appwrite user ID
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; title: string; details: string } | null>(null);
    const [isLogging, setIsLogging] = useState(false); // For clock in/out
    const [isAuthenticating, setIsAuthenticating] = useState(false); // For admin login
    const [location, setLocation] = useState<LocationState>({ status: 'Location will be captured on check-in/out.' });


    const clearStatus = () => setTimeout(() => setStatus(null), 5000);
    
    // Check if user is already logged in on component mount
    useEffect(() => {
        const checkUserSession = async () => {
            try {
                const user = await account.get();
                setIsAdmin(true);
                setCurrentAppwriteUserId(user.$id);
                setStatus({ type: 'info', title: 'Logged In', details: `Welcome back, ${user.email}!` });
            } catch (error) {
                // Not logged in, or session expired
                setIsAdmin(false);
                setCurrentAppwriteUserId(null);
            }
        };
        checkUserSession();
    }, []);


    const handleLogAction = async (action: 'IN' | 'OUT') => {
        const { firstName, lastName, employeeId } = userInfo;
        if (!firstName || !lastName || !employeeId) {
            setStatus({ type: 'error', title: 'Missing Information', details: 'Please fill out your first name, last name, and employee ID.' });
            clearStatus();
            return;
        }

        if (!currentAppwriteUserId) {
            setStatus({ type: 'error', title: 'Not Logged In', details: 'You must be logged in as an admin to record time logs.' });
            clearStatus();
            return;
        }

        setIsLogging(true);
        setStatus({ type: 'info', title: 'Processing...', details: 'Acquiring your location. Please wait.' });

        try {
            const position = await fetchLocation();
            const { latitude, longitude, accuracy } = position.coords;

            setLocation({ latitude, longitude, accuracy, status: 'Location acquired successfully.' });

            const now = new Date();
            const day = now.getDay();
            if ([0, 5, 6].includes(day)) { // Sun, Fri, Sat
                setStatus({ type: 'error', title: 'Not Allowed', details: 'Check-in and check-out are only allowed Monday-Thursday.' });
                setIsLogging(false); 
                clearStatus();
                return;
            }

            const deviceId = await getDeviceId();
            
            let durationString: string | undefined = undefined;
            let durationDetails = "";

            if (action === 'OUT') {
                // Fetch only the relevant IN logs for this user and today
                const todayStart = new Date(now.toDateString()).getTime(); // Start of today in raw timestamp
                const todayEnd = now.getTime(); // Current time

                const response = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_TIMELOGS_COLLECTION_ID,
                    [
                        Query.equal('employeeId', employeeId),
                        Query.equal('action', 'IN'),
                        Query.between('rawTimestamp', todayStart, todayEnd), // Filter for today's logs
                        Query.orderDesc('rawTimestamp'),
                        Query.limit(1) // Get only the most recent IN log
                    ]
                );
                const lastCheckIn = response.documents[0] as TimeLog | undefined;

                if (lastCheckIn) {
                    const diffMs = now.getTime() - lastCheckIn.rawTimestamp;
                    if (diffMs > 0) {
                        const totalMinutes = Math.floor(diffMs / 60000);
                        const hours = Math.floor(totalMinutes / 60);
                        const minutes = totalMinutes % 60;
                        durationString = `${hours} hours, ${minutes} minutes`;
                        durationDetails = ` Today's total time: ${durationString}.`;
                    }
                }
            }
            
            const newLog: TimeLog = {
                ...userInfo,
                action,
                timestamp: now.toLocaleString(),
                rawTimestamp: now.getTime(),
                latitude,
                longitude,
                accuracy,
                deviceId,
                userAgent: navigator.userAgent,
                duration: durationString,
            };

            // Save newLog to Appwrite database
            await databases.createDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_TIMELOGS_COLLECTION_ID,
                ID.unique(), // Let Appwrite generate a unique ID
                newLog,
                [
                    // Permissions for this specific document:
                    // Anyone can read (Role.any()) due to collection permissions
                    // Only the authenticated user who created it can modify/delete
                    Permission.read(Role.any()), // Per your initial requirement for TimesheetPanel ease
                    Permission.write(Role.user(currentAppwriteUserId)),
                    Permission.update(Role.user(currentAppwriteUserId)),
                    Permission.delete(Role.user(currentAppwriteUserId)),
                ]
            );

            setStatus({ type: 'success', title: `Successfully Clocked ${action}`, details: `Your location has been recorded at ${now.toLocaleTimeString()}.${durationDetails}` });
            clearStatus();

        } catch (error: any) {
            const errorMessage = error.message || 'An unknown error occurred.';
            setLocation({ status: `Error: ${errorMessage}`, error: errorMessage });
            setStatus({ type: 'error', title: 'Operation Failed', details: `Could not record log: ${errorMessage}. Please enable location services or ensure you are logged in.` });
            clearStatus();
        } finally {
            setIsLogging(false);
        }
    };
    
    const handleAddAbsence = async (date: string, reason: string) => {
        const { firstName, lastName, employeeId } = userInfo;
        if (!firstName || !lastName || !employeeId) {
            setStatus({ type: 'error', title: 'Missing Information', details: 'Please fill out your user info on the Time tab before logging an absence.' });
            clearStatus();
            return;
        }
        if (!date || !reason) {
             setStatus({ type: 'error', title: 'Missing Fields', details: 'Please provide both a date and a reason for the absence.' });
             clearStatus();
             return;
        }
        if (!currentAppwriteUserId) {
            setStatus({ type: 'error', title: 'Not Logged In', details: 'You must be logged in as an admin to record absence logs.' });
            clearStatus();
            return;
        }

        try {
            const newAbsence: AbsenceLog = { ...userInfo, date, reason, submitted: new Date().toLocaleString() };
            
            await databases.createDocument(
                APPWRITE_DATABASE_ID,
                APPWRITE_ABENCELOGS_COLLECTION_ID, // Corrected typo here, assuming it's APPWRITE_ABSENCELOGS_COLLECTION_ID
                ID.unique(),
                newAbsence,
                [
                    Permission.read(Role.any()), // Per your initial requirement
                    Permission.write(Role.user(currentAppwriteUserId)),
                    Permission.update(Role.user(currentAppwriteUserId)),
                    Permission.delete(Role.user(currentAppwriteUserId)),
                ]
            );

            setStatus({ type: 'success', title: 'Absence Logged', details: `Your absence for ${date} has been recorded.` });
            clearStatus();

        } catch (error: any) {
            console.error("Error logging absence:", error);
            setStatus({ type: 'error', title: 'Absence Logging Failed', details: `Could not log absence: ${error.message || 'Unknown error'}.` });
            clearStatus();
        }
    };

    const handleAdminLogin = async (email: string, password: string): Promise<boolean> => {
        setIsAuthenticating(true);
        setStatus({ type: 'info', title: 'Logging in...', details: 'Attempting to authenticate with Appwrite.' });
        try {
            await account.createEmailPasswordSession(email, password);
            const user = await account.get(); // Get user details after successful session creation
            setIsAdmin(true);
            setCurrentAppwriteUserId(user.$id);
            setStatus({ type: 'success', title: 'Login Success', details: `Welcome, ${user.email}!` });
            clearStatus();
            return true;
        } catch (error: any) {
            console.error("Login failed:", error);
            setStatus({ type: 'error', title: 'Login Failed', details: `Incorrect email or password, or API error: ${error.message}` });
            clearStatus();
            setIsAdmin(false); // Ensure admin state is false on failure
            setCurrentAppwriteUserId(null);
            return false;
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleAdminLogout = async () => {
        try {
            await account.deleteSession('current');
            setIsAdmin(false);
            setCurrentAppwriteUserId(null);
            setStatus({ type: 'info', title: 'Logged Out', details: 'You have been successfully logged out.' });
            clearStatus();
        } catch (error: any) {
            console.error("Logout failed:", error);
            setStatus({ type: 'error', title: 'Logout Failed', details: `Could not log out: ${error.message}` });
            clearStatus();
        }
    };


    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <Header />
                <div className="p-6">
                    {!isAdmin && <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />}
                    
                    {status && <StatusDisplay {...status} />}

                    {!isAdmin ? (
                        <>
                            {activeTab === Tab.Time && <TimePanel 
                                userInfo={userInfo} 
                                setUserInfo={setUserInfo} 
                                onLogAction={handleLogAction} 
                                location={location}
                                isLogging={isLogging}
                                />}
                            {activeTab === Tab.Absence && <AbsencePanel userInfo={userInfo} onAddAbsence={handleAddAbsence} />}
                            {activeTab === Tab.Timesheet && <TimesheetPanel userInfo={userInfo} />} {/* Removed logs={timeLogs} */}
                            <AdminLogin 
                                onLogin={handleAdminLogin}
                                onLoginSuccess={() => setActiveTab(Tab.Time)} // Redirect to Time tab on successful login
                                onLoginFailure={() => {}} // No specific action needed on failure, status display handles it
                                isLoggingIn={isAuthenticating}
                            />
                        </>
                    ) : (
                        <AdminPanel onLogout={handleAdminLogout} currentUserId={currentAppwriteUserId} /> {/* Removed logs and absences props */}
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
