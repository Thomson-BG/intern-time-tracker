import React, { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Tab, TimeLog, AbsenceLog, UserInfo, LocationState } from './types';
import AdminPanel from './components/AdminPanel';
import { downloadTimeLogsPDF } from './utils/downloadHelpers';
import TabBar from './components/TabBar';
import TimePanel from './components/TimePanel';
import AbsencePanel from './components/AbsencePanel';
import TimesheetPanel from './components/TimesheetPanel';

// === CONFIGURATION ===
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0lWnVu51DoaswLTDF2DP4qpLMgKjaqV5CWbii2CloMOB1I3dbqk-fTn7QTCtOmIX7DA/exec';

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
            timeout: 10000,
            maximumAge: 0
        });
    });
};

// --- UI COMPONENTS (keep as in your original code) ---

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

// ... TabBar, StatusDisplay, UserInfoForm, TimePanel, AbsencePanel, TimesheetPanel, AdminLogin ... (unchanged from your original code)

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
    const [userInfo, setUserInfo] = useLocalStorage<UserInfo>('userInfo', { firstName: '', lastName: '', employeeId: '', deviceName: '' });

    // Logs are now managed via Google Sheets, not localStorage
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [absenceLogs, setAbsenceLogs] = useState<AbsenceLog[]>([]);

    const [activeTab, setActiveTab] = useState<Tab>(Tab.Time);
    const [isAdmin, setIsAdmin] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; title: string; details: string } | null>(null);
    const [isLogging, setIsLogging] = useState(false);
    const [location, setLocation] = useState<LocationState>({ status: 'Location will be captured on check-in/out.' });

    const clearStatus = () => setTimeout(() => setStatus(null), 5000);

    // === API UTILS ===
    const fetchTimeLogs = useCallback(() => {
        if (!userInfo.employeeId) return;
        fetch(`${SCRIPT_URL}?type=timelog&employeeId=${encodeURIComponent(userInfo.employeeId)}`)
            .then(res => res.json())
            .then(data => setTimeLogs(
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
            ))
            .catch(() => setTimeLogs([]));
    }, [userInfo.employeeId]);

    const fetchAbsenceLogs = useCallback(() => {
        if (!userInfo.employeeId) return;
        fetch(`${SCRIPT_URL}?type=absencelog&employeeId=${encodeURIComponent(userInfo.employeeId)}`)
            .then(res => res.json())
            .then(data => setAbsenceLogs(
                data.map((row: any[]) => ({
                    firstName: row[0],
                    lastName: row[1],
                    employeeId: row[2],
                    deviceName: row[3],
                    date: row[4],
                    reason: row[5],
                    submitted: row[6],
                }))
            ))
            .catch(() => setAbsenceLogs([]));
    }, [userInfo.employeeId]);

    useEffect(() => {
        fetchTimeLogs();
        fetchAbsenceLogs();
    }, [userInfo.employeeId, fetchTimeLogs, fetchAbsenceLogs]);

    // === LOGGING TIME ===
    const handleLogAction = async (action: 'IN' | 'OUT') => {
        const { firstName, lastName, employeeId } = userInfo;
        if (!firstName || !lastName || !employeeId) {
            setStatus({ type: 'error', title: 'Missing Information', details: 'Please fill out your first name, last name, and student ID.' });
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
            if ([0, 5, 6].includes(day)) {
                setStatus({ type: 'error', title: 'Not Allowed', details: 'Check-in and check-out are only allowed Monday-Thursday.' });
                setIsLogging(false);
                clearStatus();
                return;
            }

            const deviceId = await getDeviceId();

            let durationString: string | undefined = undefined;
            let durationDetails = "";

            if (action === 'OUT') {
                const todayStr = now.toDateString();
                const lastCheckIn = timeLogs
                    .filter(log =>
                        log.employeeId === employeeId &&
                        log.action === 'IN' &&
                        new Date(log.rawTimestamp).toDateString() === todayStr
                    )
                    .sort((a, b) => b.rawTimestamp - a.rawTimestamp)[0];

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

            await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'timelog', ...newLog }),
            });

            setStatus({ type: 'success', title: `Successfully Clocked ${action}`, details: `Your location has been recorded at ${now.toLocaleTimeString()}.${durationDetails}` });
            fetchTimeLogs();
            clearStatus();

        } catch (error: any) {
            const errorMessage = error.message || 'An unknown error occurred.';
            setLocation({ status: `Error: ${errorMessage}`, error: errorMessage });
            setStatus({ type: 'error', title: 'Location Error', details: `Could not get location: ${errorMessage}. Please enable location services and try again.` });
            clearStatus();
        } finally {
            setIsLogging(false);
        }
    };

    // === LOGGING ABSENCE ===
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

        const newAbsence: AbsenceLog = { ...userInfo, date, reason, submitted: new Date().toLocaleString() };

        await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'absencelog', ...newAbsence }),
        });

        setStatus({ type: 'success', title: 'Absence Logged', details: `Your absence for ${date} has been recorded.` });
        fetchAbsenceLogs();
        clearStatus();
    };

    const handleLogin = (success: boolean) => {
        setIsAdmin(success);
        if (!success) {
            setStatus({ type: 'error', title: 'Login Failed', details: 'Incorrect username or password.' });
            clearStatus();
        }
    }

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
                            {activeTab === Tab.Timesheet && <TimesheetPanel logs={timeLogs} userInfo={userInfo} />}
                            <AdminLogin onLogin={handleLogin}/>
                        </>
                    ) : (
                        <AdminPanel logs={timeLogs} absences={absenceLogs} onLogout={() => setIsAdmin(false)} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
