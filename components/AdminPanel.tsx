import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TimeLog, AbsenceLog } from '../types';
import {
    downloadTimeLogsCSV, downloadTimeLogsPDF, downloadTimeLogsHTML,
    downloadAbsencesCSV, downloadAbsencesPDF, downloadAbsencesHTML
} from '../utils/downloadHelpers';

// Use your Google Apps Script URL - updated to match the API URL from .env
const SCRIPT_URL = import.meta.env.VITE_TIME_TRACKER_API || 'https://script.google.com/macros/s/AKfycbwCXc-dKoMKGxKoblHT6hVYu1XYbnnJX-_npLVM7r7BE1D-yc1LvnbMkZrronOk3OmB/exec';

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

    // Date range filtering
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [filterEmployeeId, setFilterEmployeeId] = useState<string>('');
    const [useAllDates, setUseAllDates] = useState<boolean>(true);

    // Fetch ALL time logs (no employeeId filter)
    const fetchTimeLogs = useCallback(async () => {
        setLoadingTimeLogs(true);
        setErrorTimeLogs(null);
        try {
            // Check if we're in development mode
            const isDevelopment = import.meta.env.DEV;
            
            if (isDevelopment) {
                // In development, simulate data to avoid CORS issues
                console.log('Development mode: Using mock data for time logs');
                const mockTimeLogs = [
                    {
                        firstName: 'John',
                        lastName: 'Doe',
                        employeeId: 'EMP001',
                        deviceName: 'Test Device',
                        action: 'IN',
                        timestamp: new Date().toISOString(),
                        rawTimestamp: Date.now(),
                        latitude: 40.7128,
                        longitude: -74.0060,
                        accuracy: 10,
                        deviceId: 'test-device-1',
                        userAgent: 'Test Browser',
                        duration: '',
                    },
                    {
                        firstName: 'John',
                        lastName: 'Doe',
                        employeeId: 'EMP001',
                        deviceName: 'Test Device',
                        action: 'OUT',
                        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
                        rawTimestamp: Date.now() - 8 * 60 * 60 * 1000,
                        latitude: 40.7128,
                        longitude: -74.0060,
                        accuracy: 10,
                        deviceId: 'test-device-1',
                        userAgent: 'Test Browser',
                        duration: '8 hours',
                    }
                ];
                setTimeLogs(mockTimeLogs);
                return;
            }
            
            const response = await fetch(`${SCRIPT_URL}?type=timelog`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
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
            setErrorTimeLogs(error.message || "Failed to fetch time logs");
            setTimeLogs([]);
        } finally {
            setLoadingTimeLogs(false);
        }
    }, []);

    // Fetch ALL absence logs (no employeeId filter)
    const fetchAbsenceLogs = useCallback(async () => {
        setLoadingAbsenceLogs(true);
        setErrorAbsenceLogs(null);
        try {
            // Check if we're in development mode
            const isDevelopment = import.meta.env.DEV;
            
            if (isDevelopment) {
                // In development, simulate data to avoid CORS issues
                console.log('Development mode: Using mock data for absence logs');
                const mockAbsenceLogs = [
                    {
                        firstName: 'Jane',
                        lastName: 'Smith',
                        employeeId: 'EMP002',
                        deviceName: 'Test Device',
                        date: new Date().toISOString().split('T')[0],
                        reason: 'Medical appointment',
                        submitted: new Date().toISOString(),
                    }
                ];
                setAbsenceLogs(mockAbsenceLogs);
                return;
            }
            
            const response = await fetch(`${SCRIPT_URL}?type=absencelog`, {
                method: 'GET',
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
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
            setErrorAbsenceLogs(error.message || "Failed to fetch absence logs");
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

    // Filter time logs by date range and optionally by employee ID
    const filteredTimeLogs = useMemo(() => {
        return timeLogs.filter(log => {
            const logDate = new Date(Number(log.rawTimestamp)).toISOString().split('T')[0];
            
            // Date range filtering
            let dateMatch = true;
            if (!useAllDates) {
                const logDateObj = new Date(logDate);
                if (startDate) {
                    dateMatch = dateMatch && logDateObj >= new Date(startDate);
                }
                if (endDate) {
                    dateMatch = dateMatch && logDateObj <= new Date(endDate);
                }
            }
            
            // Employee ID filtering
            const employeeIdMatch = filterEmployeeId ? (log.employeeId || '').toLowerCase().includes(filterEmployeeId.toLowerCase()) : true;
            
            return dateMatch && employeeIdMatch;
        });
    }, [timeLogs, startDate, endDate, filterEmployeeId, useAllDates]);

    // Filter absence logs by date range and employee ID
    const filteredAbsences = useMemo(() => {
        return absenceLogs.filter(abs => {
            // Date range filtering
            let dateMatch = true;
            if (!useAllDates && abs.date) {
                const absenceDate = new Date(abs.date);
                if (startDate) {
                    dateMatch = dateMatch && absenceDate >= new Date(startDate);
                }
                if (endDate) {
                    dateMatch = dateMatch && absenceDate <= new Date(endDate);
                }
            }
            
            // Employee ID filtering
            const employeeIdMatch = filterEmployeeId ? (abs.employeeId || '').toLowerCase().includes(filterEmployeeId.toLowerCase()) : true;
            
            return dateMatch && employeeIdMatch;
        });
    }, [absenceLogs, startDate, endDate, filterEmployeeId, useAllDates]);

    return (
        <div className="slide-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>

            <div className="flex justify-end mb-6 space-x-2">
                <button onClick={() => { fetchTimeLogs(); fetchAbsenceLogs(); }} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center gap-2">
                    <i className="fas fa-sync-alt"></i> Refresh Data
                </button>
                <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center gap-2">
                    <i className="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="col-span-full">
                    <CardTitle>Data Filters</CardTitle>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="useAllDates"
                                checked={useAllDates}
                                onChange={(e) => setUseAllDates(e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="useAllDates" className="text-sm font-medium text-gray-700">
                                Show All Dates (Default)
                            </label>
                        </div>
                        
                        {!useAllDates && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-4 border-blue-200 bg-blue-50 p-4 rounded-md">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                    />
                                </div>
                            </div>
                        )}
                        
                        <div>
                            <label htmlFor="filterEmployeeId" className="block text-sm font-medium text-gray-700 mb-1">Filter by Employee ID</label>
                            <input
                                type="text"
                                id="filterEmployeeId"
                                value={filterEmployeeId}
                                onChange={e => setFilterEmployeeId(e.target.value)}
                                placeholder="Enter Employee ID to filter"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            />
                        </div>
                    </div>
                </Card>
                
                <Card className="col-span-full">
                    <CardTitle>Download Options</CardTitle>
                    <div className="mb-4 text-sm text-gray-600">
                        <p>Downloads will include {useAllDates ? 'all records' : `records from ${startDate || 'beginning'} to ${endDate || 'today'}`}
                        {filterEmployeeId && ` for Employee ID containing "${filterEmployeeId}"`}</p>
                        <p className="text-xs mt-1">Found: {filteredTimeLogs.length} time records, {filteredAbsences.length} absence records</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <DownloadButton onClick={() => downloadTimeLogsCSV(filteredTimeLogs, `time_logs_${useAllDates ? 'all' : `${startDate}_to_${endDate}`}`)} text="Time Logs CSV" color="green" icon="fa-file-csv" disabled={!filteredTimeLogs.length} />
                        <DownloadButton onClick={() => downloadTimeLogsPDF(filteredTimeLogs, `Time Logs ${useAllDates ? '(All Dates)' : `from ${startDate} to ${endDate}`}`, `time_logs_${useAllDates ? 'all' : `${startDate}_to_${endDate}`}`)} text="Time Logs PDF" color="red" icon="fa-file-pdf" disabled={!filteredTimeLogs.length} />
                        <DownloadButton onClick={() => downloadTimeLogsHTML(filteredTimeLogs, `Time Logs ${useAllDates ? '(All Dates)' : `from ${startDate} to ${endDate}`}`, `time_logs_${useAllDates ? 'all' : `${startDate}_to_${endDate}`}`)} text="Time Logs HTML" color="purple" icon="fa-file-code" disabled={!filteredTimeLogs.length} />
                        <DownloadButton onClick={() => downloadAbsencesCSV(filteredAbsences, `absence_logs_${useAllDates ? 'all' : `${startDate}_to_${endDate}`}`)} text="Absence CSV" color="green" icon="fa-file-csv" disabled={!filteredAbsences.length} />
                        <DownloadButton onClick={() => downloadAbsencesPDF(filteredAbsences, `Absence Logs ${useAllDates ? '(All Dates)' : `from ${startDate} to ${endDate}`}`, `absence_logs_${useAllDates ? 'all' : `${startDate}_to_${endDate}`}`)} text="Absence PDF" color="red" icon="fa-file-pdf" disabled={!filteredAbsences.length} />
                        <DownloadButton onClick={() => downloadAbsencesHTML(filteredAbsences, `Absence Logs ${useAllDates ? '(All Dates)' : `from ${startDate} to ${endDate}`}`, `absence_logs_${useAllDates ? 'all' : `${startDate}_to_${endDate}`}`)} text="Absence HTML" color="purple" icon="fa-file-code" disabled={!filteredAbsences.length} />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Time Records {useAllDates ? '(All Dates)' : `(${startDate || 'Start'} to ${endDate || 'End'})`}
                        <span className="text-sm font-normal text-gray-600 ml-2">({filteredTimeLogs.length} records)</span>
                    </h3>
                    {loadingTimeLogs && <StatusDisplay type="info" title="Loading" details="Fetching time logs..." />}
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
                                        <div className="mt-1 text-xs text-gray-600">
                                            <p>Location: {Number(log.latitude).toFixed(5)}, {Number(log.longitude).toFixed(5)} (Accuracy: {log.accuracy}m)</p>
                                        </div>
                                    )}
                                    <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                                        <p>Device Name: {log.deviceName || 'N/A'}</p>
                                        <p className="break-all">Device ID: {log.deviceId}</p>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 py-4">No time logs match the selected filters.</p>}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Absence Records {useAllDates ? '(All Dates)' : `(${startDate || 'Start'} to ${endDate || 'End'})`}
                        <span className="text-sm font-normal text-gray-600 ml-2">({filteredAbsences.length} records)</span>
                    </h3>
                    {loadingAbsenceLogs && <StatusDisplay type="info" title="Loading" details="Fetching absence logs..." />}
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
