import React from 'react';
import { UserInfo, LocationState } from '../types';

interface TimePanelProps {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  onLogAction: (action: 'IN' | 'OUT') => void;
  onTestLogAction: (action: 'IN' | 'OUT') => void;
  location: LocationState;
  isLogging: boolean;
  isCheckedIn: boolean;
}

const TimePanel: React.FC<TimePanelProps> = ({ 
  userInfo, 
  setUserInfo, 
  onLogAction,
  onTestLogAction,
  location, 
  isLogging,
  isCheckedIn
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  // Check if required fields are filled
  const isFormValid = userInfo.firstName.trim() && userInfo.lastName.trim() && userInfo.employeeId.trim();

  return (
    <div className="space-y-6 slide-in">
      <section>
        <h2 className="text-lg font-semibold mb-3">1. Your Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={userInfo?.firstName || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={userInfo?.lastName || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-1">Employee ID *</label>
          <input
            type="text"
            name="employeeId"
            value={userInfo?.employeeId || ''}
            onChange={handleInputChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter employee ID"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-1">Device Name (e.g., My Phone, Lab PC)</label>
          <input
            type="text"
            name="deviceName"
            value={userInfo?.deviceName || ''}
            onChange={handleInputChange}
            className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">2. Clock In / Out</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onLogAction('IN')}
            disabled={isLogging || !isFormValid || isCheckedIn}
            className={`py-3 px-4 rounded flex items-center justify-center transition-colors ${
              isCheckedIn 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : isFormValid && !isLogging
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLogging ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Processing...
              </>
            ) : (
              <>
                <span className="mr-2">✓</span> 
                {isCheckedIn ? 'ALREADY CHECKED IN' : 'CHECK IN'}
              </>
            )}
          </button>
          <button
            onClick={() => onLogAction('OUT')}
            disabled={isLogging || !isFormValid || !isCheckedIn}
            className={`py-3 px-4 rounded flex items-center justify-center transition-colors ${
              !isCheckedIn 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : isFormValid && !isLogging
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLogging ? (
              <>
                <span className="animate-spin mr-2">⏳</span> Processing...
              </>
            ) : (
              <>
                <span className="mr-2">✗</span> 
                {!isCheckedIn ? 'NOT CHECKED IN' : 'CHECK OUT'}
              </>
            )}
          </button>
        </div>
        
        {/* Test buttons for development */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">🧪 Test Mode (Mock Location)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onTestLogAction('IN')}
              disabled={isLogging || !isFormValid || isCheckedIn}
              className={`py-2 px-3 rounded text-sm flex items-center justify-center transition-colors ${
                isCheckedIn 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : isFormValid && !isLogging
                    ? 'bg-green-100 border border-green-300 text-green-700 hover:bg-green-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="mr-1">🧪</span> TEST CHECK IN
            </button>
            <button
              onClick={() => onTestLogAction('OUT')}
              disabled={isLogging || !isFormValid || !isCheckedIn}
              className={`py-2 px-3 rounded text-sm flex items-center justify-center transition-colors ${
                !isCheckedIn 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : isFormValid && !isLogging
                    ? 'bg-red-100 border border-red-300 text-red-700 hover:bg-red-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="mr-1">🧪</span> TEST CHECK OUT
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Test buttons use mock location data to verify Google Sheets integration without requiring geolocation permissions.
          </p>
        </div>
        
        {/* Status indicator */}
        <div className="mt-4 p-3 rounded-lg bg-gray-50">
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
              isCheckedIn ? 'bg-green-500' : 'bg-red-500'
            }`}></span>
            <span className="text-sm font-medium">
              Current Status: {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Location Information</h2>
        {location.status === 'requesting' && (
          <p className="text-sm text-blue-600 flex items-center">
            <span className="animate-spin mr-2">⏳</span> Requesting location permission...
          </p>
        )}
        {location.status === 'success' && (
          <p className="text-sm text-green-600 flex items-center">
            <span className="mr-2">✓</span> Location captured successfully
          </p>
        )}
        {location.status === 'error' && (
          <p className="text-sm text-red-600 flex items-center">
            <span className="mr-2">✗</span> Location error: {location.error}
          </p>
        )}
        {location.status === 'idle' && (
          <p className="text-sm text-gray-600 flex items-center">
            <span className="mr-2">●</span> Location will be captured on check-in/out.
          </p>
        )}
        {location.latitude && location.longitude && (
          <div className="text-sm mt-2 bg-gray-50 p-2 rounded">
            <div>Latitude: {location.latitude.toFixed(6)}</div>
            <div>Longitude: {location.longitude.toFixed(6)}</div>
            <div>Accuracy: {location.accuracy ? `${Math.round(location.accuracy)} meters` : 'Unknown'}</div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TimePanel;
