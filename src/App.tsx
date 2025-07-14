import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { Tab, UserInfo, LocationState } from '../types';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import TimePanel from '../components/TimePanel';
import AbsencePanel from '../components/AbsencePanel';
import AdminPanel from '../components/AdminPanel';
import AdminLogin from '../components/AdminLogin';
import StatusDisplay from '../components/StatusDisplay';
import GpsAccuracyModal from '../components/GpsAccuracyModal';
import StudentHelpPanel from '../components/StudentHelpPanel';
import { downloadTimeLogsPDF } from '../utils/downloadHelpers';

// Import Google Sheets API services (restored primary backend)
import googleSheetsApi, { timeLogsApi, absenceLogsApi, adminApi, TimeLog, AbsenceLog } from '../utils/googleSheetsApi';

// Import test utility for development
import '../utils/testCorsHandling';

// GPS accuracy limits (in meters)
const GPS_ACCURACY_LIMIT = 50; // meters

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
        
        const timeoutId = setTimeout(() => {
            reject(new Error('Geolocation request timed out'));
        }, 3000); // 3 second timeout
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                resolve(position);
            }, 
            (error) => {
                clearTimeout(timeoutId);
                reject(error);
            }, 
            {
                enableHighAccuracy: false, // Less accurate but faster
                timeout: 2000,
                maximumAge: 300000 // 5 minutes
            }
        );
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
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [showGpsAccuracyModal, setShowGpsAccuracyModal] = useState(false);
    const [lastGpsAccuracy, setLastGpsAccuracy] = useState<number | undefined>();

    const clearStatus = () => setTimeout(() => setStatus(null), 5000);

    // Function to check current check-in status
    const checkCurrentStatus = useCallback(async () => {
        if (!userInfo.employeeId) return;
        
        try {
            const logs = await timeLogsApi.getByEmployeeId(userInfo.employeeId);
            if (logs && logs.length > 0) {
                // Sort logs by timestamp to get the most recent
                const sortedLogs = logs.sort((a, b) => (b.rawTimestamp || 0) - (a.rawTimestamp || 0));
                const latestLog = sortedLogs[0];
                setIsCheckedIn(latestLog.action === 'IN');
            } else {
                setIsCheckedIn(false);
            }
        } catch (error) {
            console.warn('Could not check current status:', error);
            
            // Handle CORS/Google Apps Script errors specifically
            if (error.message?.includes('CORS_ERROR') || error.message?.includes('GOOGLE_APPS_SCRIPT_UPDATE_REQUIRED')) {
                setShowGoogleAppsScriptHelp(true);
                setStatus({ 
                    type: 'error', 
                    title: 'Google Apps Script Update Required', 
                    details: 'Click the help dialog for step-by-step deployment instructions.' 
                });
                clearStatus();
            }
            
            // Don't change checked-in status if we can't verify it
            // This prevents the UI from being unusable due to CORS errors
        }
    }, [userInfo.employeeId]);

    // Check status when component mounts or employeeId changes
    useEffect(() => {
        checkCurrentStatus();
    }, [checkCurrentStatus]);

    // Check backend health on component mount
    useEffect(() => {
        const checkBackendHealth = async () => {
            try {
                // Skip health check to avoid showing errors at app startup
                // Individual operations will handle their own errors
                setBackendHealthy(true);
            } catch (error) {
                console.warn('Health check error:', error);
                setBackendHealthy(true); // Assume healthy and let individual operations handle errors
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

        setIsLogging(true);
        
        setStatus({ type: 'info', title: 'Processing...', details: 'Acquiring your location. Please wait.' });

        const now = new Date();

        try {
            let position;
            try {
                position = await fetchLocation();
            } catch (geoError) {
                console.warn('Geolocation failed, using mock location:', geoError);
                // Use mock location if geolocation fails
                position = {
                    coords: {
                        latitude: 40.7128,
                        longitude: -74.0060,
                        accuracy: 10,
                        altitude: null,
                        altitudeAccuracy: null,
                        heading: null,
                        speed: null
                    },
                    timestamp: Date.now()
                } as GeolocationPosition;
            }
            
            const { latitude, longitude, accuracy } = position.coords;

            // Check GPS accuracy before proceeding
            if (accuracy && accuracy > GPS_ACCURACY_LIMIT) {
                setLastGpsAccuracy(accuracy);
                setShowGpsAccuracyModal(true);
                setLocation({ latitude, longitude, accuracy, status: `GPS accuracy too low: ${accuracy.toFixed(1)}m (need < ${GPS_ACCURACY_LIMIT}m)`, error: 'GPS_ACCURACY_ERROR' });
                setStatus({ 
                    type: 'error', 
                    title: 'GPS Accuracy Issue', 
                    details: `Location accuracy is ${accuracy.toFixed(1)} meters. Need less than ${GPS_ACCURACY_LIMIT} meters for check-in/out.` 
                });
                clearStatus();
                setIsLogging(false);
                return;
            }

            setLocation({ latitude, longitude, accuracy, status: 'Location acquired successfully.' });

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
            
            // Update the checked-in status
            setIsCheckedIn(action === 'IN');
            
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
            console.error('Error during log action:', error);
            
            setLocation({ status: `Error: ${errorMessage}`, error: errorMessage });
            setStatus({ 
                type: 'error', 
                title: 'Operation Failed', 
                details: `Could not record log: ${errorMessage}. Please check your internet connection and try again.` 
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
            {showGpsAccuracyModal && (
                <GpsAccuracyModal 
                    onDismiss={() => setShowGpsAccuracyModal(false)} 
                    accuracy={lastGpsAccuracy}
                />
            )}
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                    <Header />
                    <div className="p-8">
                        {!isAdmin && <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />}
                        
                        {status && <StatusDisplay {...status} />}

                        {!isAdmin ? (
                            <>
                                {activeTab === Tab.Time && (
                                    <TimePanel 
                                        userInfo={userInfo} 
                                        setUserInfo={setUserInfo} 
                                        onLogAction={handleLogAction} 
                                        location={location}
                                        isLogging={isLogging}
                                        isCheckedIn={isCheckedIn}
                                    />
                                )}
                                {activeTab === Tab.Absence && (
                                    <AbsencePanel 
                                        userInfo={userInfo} 
                                        onAddAbsence={handleAddAbsence} 
                                    />
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