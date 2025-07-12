import React, { useState, useEffect } from 'react';
import { OfflineStorage } from '../utils/offlineStorage';

interface OfflineSyncNotificationProps {
  onClose: () => void;
}

const OfflineSyncNotification: React.FC<OfflineSyncNotificationProps> = ({ onClose }) => {
  const [entryCount, setEntryCount] = useState(0);

  useEffect(() => {
    const count = OfflineStorage.getEntryCount();
    setEntryCount(count);
  }, []);

  if (entryCount === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="card-glass rounded-lg p-6 max-w-md mx-4 border border-yellow-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            <i className="fas fa-wifi-slash text-yellow-500 mr-2"></i>
            Offline Entries Detected
          </h3>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="text-yellow-500 text-xl pt-1">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div>
              <p className="text-white font-medium mb-2">
                You have {entryCount} offline {entryCount === 1 ? 'entry' : 'entries'} waiting to sync.
              </p>
              <p className="text-white/80 text-sm mb-4">
                These entries were saved locally when your device was offline. They will automatically 
                sync to Google Sheets when your internet connection is restored.
              </p>
            </div>
          </div>
          
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-yellow-200 text-sm">
              <i className="fas fa-info-circle mr-1"></i>
              <strong>Important:</strong> Your time tracking and absence data is secure and will not be lost. 
              Please ensure you have an internet connection to sync these entries.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-glass text-white py-2 px-4 rounded-lg text-sm"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineSyncNotification;