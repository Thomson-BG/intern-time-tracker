import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Tab, UserInfo, LocationState } from '../types';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import TimePanel from '../components/TimePanel';
import AbsencePanel from '../components/AbsencePanel';
import TimesheetPanel from '../components/TimesheetPanel';
import AdminPanel from '../components/AdminPanel';
import AdminLogin from '../components/AdminLogin';
import StatusDisplay from '../components/StatusDisplay';
import StudentHelpPanel from '../components/StudentHelpPanel';
import { downloadTimeLogsPDF } from '../utils/downloadHelpers';

// Import MongoDB/File-based API services (more reliable than Google Sheets)
import mongoApi, { timeLogsApi, absenceLogsApi, adminApi, TimeLog, AbsenceLog } from '../utils/mongoApi';

// Helper functions
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
            timeout: 10000,
            maximumAge: 0
        });
    });
};

const App: React.FC = () => {
    const [userInfo, setUserInfo] = useLocalStorage<UserInfo>('userInfo', { 
        firstName: '', 
        lastName: '', 
        employeeId: '', 
        deviceName: '' 
    });
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Time);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentAdmin, setCurrentAdmin] = useState<{ username: string; firstName: string; lastName: string } | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; title: string; details: string } | null>(null);
    const [isLogging, setIsLogging] = useState(false);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [location, setLocation] = useState<LocationState>({ status: 'Location will be captured on check-in/out.' });
    const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);

    const clearStatus = () => setTimeout(() => setStatus(null), 5000);

    // Check backend health on component mount
    useEffect(() => {
        const checkBackendHealth = async () => {
            try {
                const isHealthy = await mongoApi.healthCheck();
                setBackendHealthy(isHealthy);
                
                if (!isHealthy) {
                    setStatus({
                        type: 'error',
                        title: 'Backend Connection Issue',
                        details: 'Cannot connect to the backend API. Please check if the server is running.'
                    });
                }
            } catch (error) {
                console.warn('Health check error:', error);
                setBackendHealthy(false);
                setStatus({
                    type: 'error',
                    title: 'Backend Connection Failed',
                    details: 'Backend server is not responding. Please check the configuration.'
                });
            }
        };
        checkBackendHealth();
    }, []);

    const handleLogAction = async (action: 'IN' | 'OUT') => {
        const { firstName, lastName, employeeId } = userInfo;
        if (!firstName || !lastName || !employeeId) {
            setStatus({ 
                type: 'error', 
                title: 'Missing Information', 
                details: 'Please fill out your first name, last name, and employee ID.' 
            });
            clearStatus();
            return;
        }

        if (!backendHealthy && !import.meta.env.DEV) {
            setStatus({
                type: 'error',
                title: 'Google Sheets Unavailable',
                details: 'Cannot connect to the Google Sheets backend. Please check the configuration.'
            });
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
                setStatus({ 
                    type: 'error', 
                    title: 'Not Allowed', 
                    details: 'Check-in and check-out are only allowed Monday-Thursday.' 
                });
                setIsLogging(false);
                clearStatus();
                return;
            }

            const deviceId = await getDeviceId();
            
            const newTimeLog: Omit<TimeLog, '_id' | 'createdAt' | 'updatedAt'> = {
                firstName,
                lastName,
                employeeId,
                deviceName: userInfo.deviceName,
                action,
                timestamp: now.toLocaleString(),
                rawTimestamp: now.getTime(),
                latitude,
                longitude,
                accuracy,
                deviceId,
                userAgent: navigator.userAgent
            };

            const savedLog = await timeLogsApi.create(newTimeLog);
            
            let durationDetails = "";
            if (savedLog.duration) {
                durationDetails = ` Today's total time: ${savedLog.duration}.`;
            }

            setStatus({ 
                type: 'success', 
                title: `Successfully Clocked ${action}`, 
                details: `Your location has been recorded at ${now.toLocaleTimeString()}.${durationDetails}` 
            });
            clearStatus();

        } catch (error: any) {
            const errorMessage = error.message || 'An unknown error occurred.';
            setLocation({ status: `Error: ${errorMessage}`, error: errorMessage });
            setStatus({ 
                type: 'error', 
                title: 'Operation Failed', 
                details: `Could not record log: ${errorMessage}. Please enable location services.` 
            });
            clearStatus();
        } finally {
            setIsLogging(false);
        }
    };
    
    const handleAddAbsence = async (date: string, reason: string) => {
        const { firstName, lastName, employeeId } = userInfo;
        if (!firstName || !lastName || !employeeId) {
            setStatus({ 
                type: 'error', 
                title: 'Missing Information', 
                details: 'Please fill out your user info on the Time tab before logging an absence.' 
            });
            clearStatus();
            return;
        }
        if (!date || !reason) {
             setStatus({ 
                type: 'error', 
                title: 'Missing Fields', 
                details: 'Please provide both a date and a reason for the absence.' 
            });
             clearStatus();
             return;
        }

        if (!backendHealthy && !import.meta.env.DEV) {
            setStatus({
                type: 'error',
                title: 'Google Sheets Unavailable',
                details: 'Cannot connect to the Google Sheets backend. Please check the configuration.'
            });
            clearStatus();
            return;
        }

        try {
            const newAbsence: Omit<AbsenceLog, '_id' | 'createdAt' | 'updatedAt'> = { 
                firstName,
                lastName, 
                employeeId,
                deviceName: userInfo.deviceName,
                date, 
                reason, 
                submitted: new Date().toLocaleString() 
            };
            
            await absenceLogsApi.create(newAbsence);

            setStatus({ 
                type: 'success', 
                title: 'Absence Logged', 
                details: `Your absence for ${date} has been recorded.` 
            });
            clearStatus();

        } catch (error: any) {
            console.error("Error logging absence:", error);
            setStatus({ 
                type: 'error', 
                title: 'Absence Logging Failed', 
                details: `Could not log absence: ${error.message || 'Unknown error'}.` 
            });
            clearStatus();
        }
    };

    const handleAdminLogin = async (username: string, password: string): Promise<boolean> => {
        setIsAuthenticating(true);
        setStatus({ type: 'info', title: 'Logging in...', details: 'Attempting to authenticate with the backend.' });
        
        try {
            const admin = await adminApi.login(username, password);
            setIsAdmin(true);
            setCurrentAdmin({
                username: admin.username,
                firstName: admin.firstName,
                lastName: admin.lastName
            });
            setStatus({ 
                type: 'success', 
                title: 'Login Success', 
                details: `Welcome, ${admin.firstName} ${admin.lastName}!` 
            });
            clearStatus();
            return true;
        } catch (error: any) {
            console.error("Login failed:", error);
            setStatus({ 
                type: 'error', 
                title: 'Login Failed', 
                details: `Incorrect username or password: ${error.message}` 
            });
            clearStatus();
            setIsAdmin(false);
            setCurrentAdmin(null);
            return false;
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleAdminLogout = async () => {
        setIsAdmin(false);
        setCurrentAdmin(null);
        setStatus({ 
            type: 'info', 
            title: 'Logged Out', 
            details: 'You have been successfully logged out.' 
        });
        clearStatus();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                    <Header />
                    <div className="p-8">
                        {!isAdmin && <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />}
                        
                        {status && <StatusDisplay {...status} />}

                        {!backendHealthy && !import.meta.env.DEV && (
                            <div className="mb-6 p-4 bg-red-900/50 border border-red-500/30 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <i className="fas fa-exclamation-triangle text-red-400 text-xl"></i>
                                    <div>
                                        <h3 className="text-lg font-bold text-red-300">Google Sheets Connection Issue</h3>
                                        <p className="text-sm text-red-200">
                                            Please ensure the Google Sheets Apps Script is properly configured and deployed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isAdmin ? (
                            <>
                                {activeTab === Tab.Time && (
                                    <TimePanel 
                                        userInfo={userInfo} 
                                        setUserInfo={setUserInfo} 
                                        onLogAction={handleLogAction} 
                                        location={location}
                                        isLogging={isLogging}
                                    />
                                )}
                                {activeTab === Tab.Absence && (
                                    <AbsencePanel 
                                        userInfo={userInfo} 
                                        onAddAbsence={handleAddAbsence} 
                                    />
                                )}
                                {activeTab === Tab.Timesheet && (
                                    <TimesheetPanel userInfo={userInfo} />
                                )}
                                {activeTab === Tab.Help && (
                                    <StudentHelpPanel />
                                )}
                                <AdminLogin 
                                    onLogin={(success, userRole, currentUser) => {
                                        if (success && currentUser) {
                                            setIsAdmin(true);
                                            setCurrentAdmin({
                                                username: currentUser.employeeId,
                                                firstName: currentUser.firstName,
                                                lastName: currentUser.lastName
                                            });
                                            setStatus({ 
                                                type: 'success', 
                                                title: 'Login Success', 
                                                details: `Welcome, ${currentUser.firstName} ${currentUser.lastName}!` 
                                            });
                                            setIsAuthenticating(false);
                                        } else {
                                            setIsAdmin(false);
                                            setCurrentAdmin(null);
                                            setIsAuthenticating(false);
                                        }
                                    }}
                                    onLoginSuccess={() => setActiveTab(Tab.Time)}
                                    onLoginFailure={() => {}}
                                    isLoggingIn={isAuthenticating}
                                />
                            </>
                        ) : (
                            <AdminPanel 
                                onLogout={handleAdminLogout} 
                                currentAdmin={currentAdmin}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;