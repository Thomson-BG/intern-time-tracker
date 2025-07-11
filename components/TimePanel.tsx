import React from 'react';
import { UserInfo, LocationState } from '../types';

interface TimePanelProps {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  onLogAction: (action: 'IN' | 'OUT') => void;
  location: LocationState;
  isLogging: boolean;
  isCheckedIn: boolean;
}

const TimePanel: React.FC<TimePanelProps> = ({ 
  userInfo, 
  setUserInfo, 
  onLogAction,
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
        
        {/* GPS Coordinates Display with Map View */}
        {location.latitude && location.longitude && (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coordinates Info */}
              <div className="text-sm bg-gray-50 p-3 rounded">
                <div><strong>Latitude:</strong> {location.latitude.toFixed(6)}</div>
                <div><strong>Longitude:</strong> {location.longitude.toFixed(6)}</div>
                <div><strong>Accuracy:</strong> {location.accuracy ? `${Math.round(location.accuracy)} meters` : 'Unknown'}</div>
              </div>
              
              {/* Map View */}
              <div className="bg-gray-100 border border-gray-300 rounded relative overflow-hidden">
                <div className="aspect-square w-full">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO_4O0fL3wL1gs&center=${location.latitude},${location.longitude}&zoom=15&maptype=satellite`}
                    title="Current Location Map"
                  />
                  {/* Fallback if Google Maps doesn't work */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-600 text-sm">
                    <div className="text-center">
                      <div className="mb-2">📍</div>
                      <div>GPS Location</div>
                      <div className="text-xs">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* No location available */}
        {!location.latitude && !location.longitude && (
          <div className="mt-4 bg-gray-100 border border-gray-300 rounded p-4">
            <div className="text-center text-gray-600">
              <div className="mb-2">📍</div>
              <div className="text-sm">No GPS coordinates available</div>
              <div className="text-xs text-gray-500 mt-1">Location will be shown after check-in/out</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TimePanel;
