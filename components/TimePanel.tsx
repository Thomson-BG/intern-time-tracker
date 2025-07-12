import React from 'react';
import { UserInfo, LocationState } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
      <section className="glass-card p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <i className="fas fa-user text-purple-400"></i>
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={userInfo?.firstName || ''}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors backdrop-blur-sm"
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={userInfo?.lastName || ''}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors backdrop-blur-sm"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Employee ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="employeeId"
            value={userInfo?.employeeId || ''}
            onChange={handleInputChange}
            className="w-full bg-white/10 border border-white/20 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors backdrop-blur-sm"
            placeholder="Enter employee ID"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Device Name (Optional)
          </label>
          <input
            type="text"
            name="deviceName"
            value={userInfo?.deviceName || ''}
            onChange={handleInputChange}
            className="w-full bg-white/10 border border-white/20 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors backdrop-blur-sm"
            placeholder="e.g., My Phone, Lab PC, Personal Laptop"
          />
        </div>
      </section>
      
      <section className="glass-card p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <i className="fas fa-clock text-purple-400"></i>
          Clock In / Out
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => onLogAction('IN')}
            disabled={isLogging || !isFormValid || isCheckedIn}
            className={`py-4 px-6 rounded-lg flex items-center justify-center transition-all duration-200 font-medium ${
              isCheckedIn 
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-600' 
                : isFormValid && !isLogging
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-green-500/30'
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-600'
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
                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-600' 
                : isFormValid && !isLogging
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 border border-red-500/30'
                  : 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-600'
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
        <div className="p-4 rounded-lg glass border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                isCheckedIn ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}></span>
              <span className="text-sm font-medium text-white">
                Current Status: <span className={isCheckedIn ? 'text-green-400' : 'text-red-400'}>
                  {isCheckedIn ? 'Checked In' : 'Checked Out'}
                </span>
              </span>
            </div>
            <div className="text-xs text-gray-300">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <i className="fas fa-map-marker-alt text-purple-400"></i>
          Location Information
        </h2>
        
        <div className="space-y-3">
          {location.status === 'requesting' && (
            <div className="flex items-center p-3 glass border border-blue-500/30 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400 mr-3"></div>
              <span className="text-sm text-blue-300">Requesting location permission...</span>
            </div>
          )}
          
          {location.status === 'success' && (
            <div className="flex items-center p-3 glass border border-green-500/30 rounded-md">
              <i className="fas fa-check-circle text-green-400 mr-3"></i>
              <span className="text-sm text-green-300">Location captured successfully</span>
            </div>
          )}
          
          {location.status === 'error' && (
            <div className="flex items-center p-3 glass border border-red-500/30 rounded-md">
              <i className="fas fa-exclamation-circle text-red-400 mr-3"></i>
              <span className="text-sm text-red-300">Location error: {location.error}</span>
            </div>
          )}
          
          {location.status === 'idle' && (
            <div className="flex items-center p-3 glass border border-gray-500/30 rounded-md">
              <i className="fas fa-info-circle text-gray-400 mr-3"></i>
              <span className="text-sm text-gray-300">Location will be captured on check-in/out</span>
            </div>
          )}
          
          {location.latitude && location.longitude && (
            <>
              <div className="glass p-4 rounded-md border border-white/20">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Current Location</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-400">
                  <div>
                    <span className="font-medium text-white">Latitude:</span> {location.latitude.toFixed(6)}
                  </div>
                  <div>
                    <span className="font-medium text-white">Longitude:</span> {location.longitude.toFixed(6)}
                  </div>
                  <div>
                    <span className="font-medium text-white">Accuracy:</span> {location.accuracy ? `${Math.round(location.accuracy)}m` : 'Unknown'}
                  </div>
                </div>
              </div>
              
              <div className="glass p-4 rounded-md border border-white/20">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Location Map</h4>
                <div className="h-64 rounded-md overflow-hidden">
                  <MapContainer
                    center={[location.latitude, location.longitude]}
                    zoom={15}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[location.latitude, location.longitude]}>
                      <Popup>
                        Your current location<br />
                        Accuracy: {location.accuracy ? `${Math.round(location.accuracy)}m` : 'Unknown'}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default TimePanel;
