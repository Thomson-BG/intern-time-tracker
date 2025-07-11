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
      <section className="card-glass rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
          <i className="fas fa-user mr-2"></i>
          1. Your Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2 text-white/80">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={userInfo?.firstName || ''}
              onChange={handleInputChange}
              className="w-full input-glass rounded-lg p-3 transition-all duration-300"
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-white/80">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={userInfo?.lastName || ''}
              onChange={handleInputChange}
              className="w-full input-glass rounded-lg p-3 transition-all duration-300"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-2 text-white/80">Employee ID *</label>
          <input
            type="text"
            name="employeeId"
            value={userInfo?.employeeId || ''}
            onChange={handleInputChange}
            className="w-full input-glass rounded-lg p-3 transition-all duration-300"
            placeholder="Enter employee ID"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-2 text-white/80">Device Name (e.g., My Phone, Lab PC)</label>
          <input
            type="text"
            name="deviceName"
            value={userInfo?.deviceName || ''}
            onChange={handleInputChange}
            className="w-full input-glass rounded-lg p-3 transition-all duration-300"
            placeholder="Optional"
          />
        </div>
      </section>

      <section className="card-glass rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
          <i className="fas fa-clock mr-2"></i>
          2. Clock In / Out
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => onLogAction('IN')}
            disabled={isLogging || !isFormValid || isCheckedIn}
            className={`py-4 px-6 rounded-lg flex items-center justify-center transition-all duration-300 font-semibold ${
              isCheckedIn 
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' 
                : isFormValid && !isLogging
                  ? 'bg-green-500/80 hover:bg-green-500 text-white transform hover:scale-105 shadow-lg hover:shadow-green-500/25'
                  : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isLogging ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
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
            className={`py-4 px-6 rounded-lg flex items-center justify-center transition-all duration-300 font-semibold ${
              !isCheckedIn 
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed' 
                : isFormValid && !isLogging
                  ? 'bg-red-500/80 hover:bg-red-500 text-white transform hover:scale-105 shadow-lg hover:shadow-red-500/25'
                  : 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
            }`}
          >
            {isLogging ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Processing...
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
        <div className="mt-4 glass-light rounded-lg p-4">
          <div className="flex items-center">
            <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
              isCheckedIn ? 'bg-green-400' : 'bg-red-400'
            }`}></span>
            <span className="text-sm font-medium text-white">
              Current Status: {isCheckedIn ? 'Checked In' : 'Checked Out'}
            </span>
          </div>
        </div>
      </section>

      <section className="card-glass rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-white flex items-center">
          <i className="fas fa-map-marker-alt mr-2"></i>
          Location Information
        </h2>
        {location.status === 'requesting' && (
          <p className="text-sm text-blue-300 flex items-center mb-4">
            <i className="fas fa-spinner fa-spin mr-2"></i> Requesting location permission...
          </p>
        )}
        {location.status === 'success' && (
          <p className="text-sm text-green-300 flex items-center mb-4">
            <i className="fas fa-check mr-2"></i> Location captured successfully
          </p>
        )}
        {location.status === 'error' && (
          <p className="text-sm text-red-300 flex items-center mb-4">
            <i className="fas fa-exclamation-triangle mr-2"></i> Location error: {location.error}
          </p>
        )}
        {location.status === 'idle' && (
          <p className="text-sm text-white/70 flex items-center mb-4">
            <i className="fas fa-info-circle mr-2"></i> Location will be captured on check-in/out.
          </p>
        )}
        
        {/* GPS Coordinates Display with Map View */}
        {location.latitude && location.longitude && (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coordinates Info */}
              <div className="text-sm glass-light rounded-lg p-4">
                <div className="text-white mb-2"><strong>Latitude:</strong> {location.latitude.toFixed(6)}</div>
                <div className="text-white mb-2"><strong>Longitude:</strong> {location.longitude.toFixed(6)}</div>
                <div className="text-white/80"><strong>Accuracy:</strong> {location.accuracy ? `${Math.round(location.accuracy)} meters` : 'Unknown'}</div>
              </div>
              
              {/* Map View */}
              <div className="glass border border-white/20 rounded-lg relative overflow-hidden">
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
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80 text-white text-sm">
                    <div className="text-center">
                      <div className="mb-2">📍</div>
                      <div>GPS Location</div>
                      <div className="text-xs text-white/80">
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
          <div className="mt-4 glass-light rounded-lg p-6">
            <div className="text-center text-white/80">
              <div className="mb-2 text-2xl">📍</div>
              <div className="text-sm">No GPS coordinates available</div>
              <div className="text-xs text-white/60 mt-1">Location will be shown after check-in/out</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TimePanel;
