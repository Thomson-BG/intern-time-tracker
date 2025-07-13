import React, { useState, useEffect, useMemo } from 'react';
import { timeLogsApi, absenceLogsApi, adminApi, TimeLog, AbsenceLog, AdminCredential } from '../utils/mongoApi';
import {
    downloadTimeLogsCSV, downloadTimeLogsPDF, downloadTimeLogsHTML,
    downloadAbsencesCSV, downloadAbsencesPDF, downloadAbsencesHTML
} from '../utils/downloadHelpers';

interface AdminPanelProps {
    onLogout: () => void;
    currentAdmin: { username: string; firstName: string; lastName: string } | null;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, currentAdmin }) => {
    const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
    const [absenceLogs, setAbsenceLogs] = useState<AbsenceLog[]>([]);
    const [adminUsers, setAdminUsers] = useState<AdminCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<'overview' | 'timeLogs' | 'absences' | 'admins'>('overview');
    
    // New admin form state
    const [newAdmin, setNewAdmin] = useState({
        firstName: '',
        lastName: '',
        employeeId: '',
        username: '',
        password: '',
        role: 'admin'
    });
    const [creatingAdmin, setCreatingAdmin] = useState(false);

    // Load data on component mount
    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [timeLogsData, absenceLogsData, adminUsersData] = await Promise.all([
                timeLogsApi.getAll(),
                absenceLogsApi.getAll(),
                adminApi.getAllCredentials()
            ]);
            
            setTimeLogs(timeLogsData);
            setAbsenceLogs(absenceLogsData);
            setAdminUsers(adminUsersData);
        } catch (err: any) {
            console.error('Error loading admin data:', err);
            setError(`Failed to load data: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAdmin.firstName || !newAdmin.lastName || !newAdmin.employeeId || !newAdmin.username || !newAdmin.password) {
            setError('All fields are required for creating an admin');
            return;
        }

        setCreatingAdmin(true);
        try {
            await adminApi.createCredential(newAdmin);
            setNewAdmin({
                firstName: '',
                lastName: '',
                employeeId: '',
                username: '',
                password: '',
                role: 'admin'
            });
            await loadAllData(); // Refresh the admin list
        } catch (err: any) {
            console.error('Error creating admin:', err);
            setError(`Failed to create admin: ${err.message}`);
        } finally {
            setCreatingAdmin(false);
        }
    };

    // Calculate statistics
    const stats = useMemo(() => {
        const totalStudents = new Set(timeLogs.map(log => log.employeeId)).size;
        const totalCheckIns = timeLogs.filter(log => log.action === 'IN').length;
        const totalCheckOuts = timeLogs.filter(log => log.action === 'OUT').length;
        const totalAbsences = absenceLogs.length;
        
        // Calculate total hours from duration strings
        let totalMinutes = 0;
        timeLogs.forEach(log => {
            if (log.duration && log.action === 'OUT') {
                const match = log.duration.match(/(\d+) hours?, (\d+) minutes?/);
                if (match) {
                    const hours = parseInt(match[1]);
                    const minutes = parseInt(match[2]);
                    totalMinutes += hours * 60 + minutes;
                }
            }
        });
        
        const totalHours = Math.floor(totalMinutes / 60);
        const remainingMinutes = totalMinutes % 60;

        return {
            totalStudents,
            totalCheckIns,
            totalCheckOuts,
            totalAbsences,
            totalHours,
            remainingMinutes
        };
    }, [timeLogs, absenceLogs]);

    if (loading) {
        return (
            <div className="glass-card p-8 rounded-lg border border-white/10 text-center">
                <i className="fas fa-spinner fa-spin text-purple-400 text-4xl mb-4"></i>
                <p className="text-gray-300">Loading admin dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card p-8 rounded-lg border border-white/10">
                <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <i className="fas fa-exclamation-triangle text-red-400 text-xl"></i>
                        <div>
                            <h3 className="text-lg font-bold text-red-300">Error Loading Data</h3>
                            <p className="text-sm text-red-200">{error}</p>
                        </div>
                    </div>
                    <button 
                        onClick={loadAllData}
                        className="mt-4 glass-button px-4 py-2 rounded-lg text-sm font-medium"
                    >
                        <i className="fas fa-sync-alt mr-2"></i>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="slide-in">
            {/* Header */}
            <div className="glass-card p-6 rounded-lg border border-white/10 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                            <i className="fas fa-shield-alt text-purple-400"></i>
                            Administrative Dashboard
                        </h1>
                        <p className="text-gray-300">
                            Welcome back, {currentAdmin?.firstName} {currentAdmin?.lastName}
                        </p>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="glass-button px-4 py-2 rounded-lg text-sm font-medium mt-4 md:mt-0"
                    >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Logout
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <div className="glass-card p-4 rounded-lg border border-white/10 text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.totalStudents}</div>
                    <div className="text-sm text-gray-300">Students</div>
                </div>
                <div className="glass-card p-4 rounded-lg border border-white/10 text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.totalCheckIns}</div>
                    <div className="text-sm text-gray-300">Check-ins</div>
                </div>
                <div className="glass-card p-4 rounded-lg border border-white/10 text-center">
                    <div className="text-2xl font-bold text-red-400">{stats.totalCheckOuts}</div>
                    <div className="text-sm text-gray-300">Check-outs</div>
                </div>
                <div className="glass-card p-4 rounded-lg border border-white/10 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.totalAbsences}</div>
                    <div className="text-sm text-gray-300">Absences</div>
                </div>
                <div className="glass-card p-4 rounded-lg border border-white/10 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                        {stats.totalHours}h {stats.remainingMinutes}m
                    </div>
                    <div className="text-sm text-gray-300">Total Hours</div>
                </div>
                <div className="glass-card p-4 rounded-lg border border-white/10 text-center">
                    <div className="text-2xl font-bold text-cyan-400">{adminUsers.length}</div>
                    <div className="text-sm text-gray-300">Admins</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="glass-card p-6 rounded-lg border border-white/10">
                <div className="flex flex-wrap gap-2 mb-6">
                    {[
                        { key: 'overview', label: 'Overview', icon: 'fa-chart-bar' },
                        { key: 'timeLogs', label: 'Time Logs', icon: 'fa-clock' },
                        { key: 'absences', label: 'Absences', icon: 'fa-calendar-times' },
                        { key: 'admins', label: 'Admin Users', icon: 'fa-users-cog' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setSelectedTab(tab.key as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedTab === tab.key
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'glass-button hover:bg-white/10'
                            }`}
                        >
                            <i className={`fas ${tab.icon} mr-2`}></i>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {selectedTab === 'overview' && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">System Overview</h3>
                        <div className="space-y-4">
                            <div className="glass p-4 rounded-lg border border-white/20">
                                <h4 className="font-medium text-white mb-2">Download All Time Logs</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => downloadTimeLogsPDF(timeLogs, 'All Time Logs', 'all_time_logs')}
                                        className="glass-button px-3 py-2 rounded text-sm"
                                    >
                                        <i className="fas fa-file-pdf mr-2"></i>PDF
                                    </button>
                                    <button
                                        onClick={() => downloadTimeLogsCSV(timeLogs, 'all_time_logs')}
                                        className="glass-button px-3 py-2 rounded text-sm"
                                    >
                                        <i className="fas fa-file-csv mr-2"></i>CSV
                                    </button>
                                    <button
                                        onClick={() => downloadTimeLogsHTML(timeLogs, 'All Time Logs', 'all_time_logs')}
                                        className="glass-button px-3 py-2 rounded text-sm"
                                    >
                                        <i className="fas fa-file-code mr-2"></i>HTML
                                    </button>
                                </div>
                            </div>
                            
                            <div className="glass p-4 rounded-lg border border-white/20">
                                <h4 className="font-medium text-white mb-2">Download All Absence Logs</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => downloadAbsencesPDF(absenceLogs, 'All Absence Logs', 'all_absence_logs')}
                                        className="glass-button px-3 py-2 rounded text-sm"
                                    >
                                        <i className="fas fa-file-pdf mr-2"></i>PDF
                                    </button>
                                    <button
                                        onClick={() => downloadAbsencesCSV(absenceLogs, 'all_absence_logs')}
                                        className="glass-button px-3 py-2 rounded text-sm"
                                    >
                                        <i className="fas fa-file-csv mr-2"></i>CSV
                                    </button>
                                    <button
                                        onClick={() => downloadAbsencesHTML(absenceLogs, 'All Absence Logs', 'all_absence_logs')}
                                        className="glass-button px-3 py-2 rounded text-sm"
                                    >
                                        <i className="fas fa-file-code mr-2"></i>HTML
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {selectedTab === 'timeLogs' && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Time Logs</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-black/30">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Employee</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Timestamp</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {timeLogs.slice(0, 20).map((log) => (
                                        <tr key={log._id} className="hover:bg-white/5">
                                            <td className="px-4 py-2 text-white">
                                                {log.firstName} {log.lastName} ({log.employeeId})
                                            </td>
                                            <td className={`px-4 py-2 font-medium ${
                                                log.action === 'IN' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {log.action}
                                            </td>
                                            <td className="px-4 py-2 text-gray-300">{log.timestamp}</td>
                                            <td className="px-4 py-2 text-gray-300">{log.duration || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === 'absences' && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Absence Logs</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-black/30">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Employee</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Reason</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {absenceLogs.slice(0, 20).map((log) => (
                                        <tr key={log._id} className="hover:bg-white/5">
                                            <td className="px-4 py-2 text-white">
                                                {log.firstName} {log.lastName} ({log.employeeId})
                                            </td>
                                            <td className="px-4 py-2 text-gray-300">{log.date}</td>
                                            <td className="px-4 py-2 text-gray-300">{log.reason}</td>
                                            <td className="px-4 py-2 text-gray-300">{log.submitted}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {selectedTab === 'admins' && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Admin Users</h3>
                        
                        {/* Create New Admin Form */}
                        <form onSubmit={handleCreateAdmin} className="glass p-4 rounded-lg border border-white/20 mb-6">
                            <h4 className="font-medium text-white mb-3">Create New Admin</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={newAdmin.firstName}
                                    onChange={(e) => setNewAdmin({...newAdmin, firstName: e.target.value})}
                                    className="px-3 py-2 border border-white/20 rounded-lg bg-black/30 text-white placeholder-gray-400"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={newAdmin.lastName}
                                    onChange={(e) => setNewAdmin({...newAdmin, lastName: e.target.value})}
                                    className="px-3 py-2 border border-white/20 rounded-lg bg-black/30 text-white placeholder-gray-400"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Employee ID"
                                    value={newAdmin.employeeId}
                                    onChange={(e) => setNewAdmin({...newAdmin, employeeId: e.target.value})}
                                    className="px-3 py-2 border border-white/20 rounded-lg bg-black/30 text-white placeholder-gray-400"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={newAdmin.username}
                                    onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                                    className="px-3 py-2 border border-white/20 rounded-lg bg-black/30 text-white placeholder-gray-400"
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newAdmin.password}
                                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                                    className="px-3 py-2 border border-white/20 rounded-lg bg-black/30 text-white placeholder-gray-400"
                                    required
                                />
                                <select
                                    value={newAdmin.role}
                                    onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                                    className="px-3 py-2 border border-white/20 rounded-lg bg-black/30 text-white"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="supervisor">Supervisor</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={creatingAdmin}
                                className="mt-4 glass-button px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                            >
                                {creatingAdmin ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-plus mr-2"></i>
                                        Create Admin
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Admin List */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-black/30">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Name</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Username</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Employee ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {adminUsers.map((admin) => (
                                        <tr key={admin._id} className="hover:bg-white/5">
                                            <td className="px-4 py-2 text-white">
                                                {admin.firstName} {admin.lastName}
                                            </td>
                                            <td className="px-4 py-2 text-gray-300">{admin.username}</td>
                                            <td className="px-4 py-2 text-gray-300">{admin.employeeId}</td>
                                            <td className="px-4 py-2 text-gray-300 capitalize">{admin.role}</td>
                                            <td className="px-4 py-2 text-gray-300">
                                                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;