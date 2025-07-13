import React, { useState, useRef } from 'react';

interface AdminPanelProps {
    onLogout: () => void;
    currentAdmin: { username: string; firstName: string; lastName: string } | null;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, currentAdmin }) => {
    const [refreshKey, setRefreshKey] = useState(0);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    const googleSheetsUrl = "https://docs.google.com/spreadsheets/d/1LVY9UfJq3pZr_Y7bF37n3JYnsOL1slTSMp7TnxAqLRI/edit?gid=0#gid=0";

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
                    <div className="flex gap-3 mt-4 md:mt-0">
                        <button 
                            onClick={handleRefresh}
                            className="glass-button px-4 py-2 rounded-lg text-sm font-medium"
                            title="Refresh Google Sheets"
                        >
                            <i className="fas fa-sync-alt mr-2"></i>
                            Refresh
                        </button>
                        <button 
                            onClick={onLogout}
                            className="glass-button px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            <i className="fas fa-sign-out-alt mr-2"></i>
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Google Sheets Iframe */}
            <div className="glass-card rounded-lg border border-white/10 overflow-hidden">
                <div className="bg-black/30 p-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <i className="fas fa-table text-green-400"></i>
                        Google Sheets Data
                    </h3>
                    <p className="text-gray-300 text-sm mt-1">
                        Live view of time logs, absence requests, and admin data
                    </p>
                </div>
                
                <div className="relative" style={{ height: '600px' }}>
                    <iframe
                        ref={iframeRef}
                        key={refreshKey}
                        src={googleSheetsUrl}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        className="w-full h-full"
                        title="Google Sheets Admin Dashboard"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                    
                    {/* Loading overlay */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none opacity-0 transition-opacity duration-300" 
                         id="iframe-loading">
                        <div className="text-center">
                            <i className="fas fa-spinner fa-spin text-purple-400 text-2xl mb-2"></i>
                            <p className="text-white">Loading Google Sheets...</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-black/30 p-3 border-t border-white/10">
                    <p className="text-gray-400 text-xs flex items-center gap-2">
                        <i className="fas fa-info-circle"></i>
                        Direct access to Google Sheets for real-time data management. 
                        Use the refresh button above if data doesn't load properly.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;