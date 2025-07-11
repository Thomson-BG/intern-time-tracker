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
      <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <i className="fas fa-user text-blue-600"></i>
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={userInfo?.firstName || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={userInfo?.lastName || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Employee ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="employeeId"
            value={userInfo?.employeeId || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter employee ID"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Device Name (Optional)
          </label>
          <input
            type="text"
            name="deviceName"
            value={userInfo?.deviceName || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="e.g., My Phone, Lab PC, Personal Laptop"
          />
        </div>
      </section>
      
      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <i className="fas fa-clock text-blue-600"></i>
          Clock In / Out
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => onLogAction('IN')}
            disabled={isLogging || !isFormValid || isCheckedIn}
            className={`py-4 px-6 rounded-lg flex items-center justify-center transition-all duration-200 font-medium ${
              isCheckedIn 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : isFormValid && !isLogging
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLogging ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                {isCheckedIn ? 'ALREADY CHECKED IN' : 'CHECK IN'}
              </>
            )}
          </button>
          
          <button
            onClick={() => onLogAction('OUT')}
            disabled={isLogging || !isFormValid || !isCheckedIn}
            className={`py-4 px-6 rounded-lg flex items-center justify-center transition-all duration-200 font-medium ${
              !isCheckedIn 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : isFormValid && !isLogging
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLogging ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <i className="fas fa-sign-out-alt mr-2"></i>
                {!isCheckedIn ? 'NOT CHECKED IN' : 'CHECK OUT'}
              </>
            )}
          </button>
        </div>
        
        {/* Status indicator */}
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                isCheckedIn ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></span>
              <span className="text-sm font-medium text-gray-700">
                Current Status: <span className={isCheckedIn ? 'text-green-600' : 'text-red-600'}>
                  {isCheckedIn ? 'Checked In' : 'Checked Out'}
                </span>
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        
        {/* Test buttons for development */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
            <i className="fas fa-flask text-purple-500"></i>
            Development Test Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => onTestLogAction('IN')}
              disabled={isLogging || !isFormValid || isCheckedIn}
              className={`py-3 px-4 rounded-md text-sm flex items-center justify-center transition-colors ${
                isCheckedIn 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : isFormValid && !isLogging
                    ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-flask mr-2"></i>
              TEST CHECK IN
            </button>
            <button
              onClick={() => onTestLogAction('OUT')}
              disabled={isLogging || !isFormValid || !isCheckedIn}
              className={`py-3 px-4 rounded-md text-sm flex items-center justify-center transition-colors ${
                !isCheckedIn 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : isFormValid && !isLogging
                    ? 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <i className="fas fa-flask mr-2"></i>
              TEST CHECK OUT
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Test buttons use mock location data to verify Google Sheets integration without requiring geolocation permissions.
          </p>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
          <i className="fas fa-map-marker-alt text-blue-600"></i>
          Location Information
        </h2>
        
        <div className="space-y-3">
          {location.status === 'requesting' && (
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
              <span className="text-sm text-blue-700">Requesting location permission...</span>
            </div>
          )}
          
          {location.status === 'success' && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-md">
              <i className="fas fa-check-circle text-green-500 mr-3"></i>
              <span className="text-sm text-green-700">Location captured successfully</span>
            </div>
          )}
          
          {location.status === 'error' && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-md">
              <i className="fas fa-exclamation-circle text-red-500 mr-3"></i>
              <span className="text-sm text-red-700">Location error: {location.error}</span>
            </div>
          )}
          
          {location.status === 'idle' && (
            <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-md">
              <i className="fas fa-info-circle text-gray-500 mr-3"></i>
              <span className="text-sm text-gray-600">Location will be captured on check-in/out</span>
            </div>
          )}
          
          {location.latitude && location.longitude && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Latitude:</span> {location.latitude.toFixed(6)}
                </div>
                <div>
                  <span className="font-medium">Longitude:</span> {location.longitude.toFixed(6)}
                </div>
                <div>
                  <span className="font-medium">Accuracy:</span> {location.accuracy ? `${Math.round(location.accuracy)}m` : 'Unknown'}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TimePanel;
