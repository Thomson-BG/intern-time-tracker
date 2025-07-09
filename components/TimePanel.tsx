import React, { useState, useEffect } from 'react';
import { submitTimeLog, calculateDuration } from '../utils/apiService';

interface TimePanelProps {
  userInfo: any;
  setUserInfo: (info: any) => void;
  onLogAction: () => void;
  location: any;
  isLogging: boolean;
}

const TimePanel: React.FC<TimePanelProps> = ({
  userInfo,
  setUserInfo,
  onLogAction,
  location,
  isLogging
}) => {
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [lastCheckIn, setLastCheckIn] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duration, setDuration] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve last check-in time from localStorage if available
    const storedCheckIn = localStorage.getItem('lastCheckIn');
    if (storedCheckIn) {
      setLastCheckIn(parseInt(storedCheckIn, 10));
    }
    
    // Retrieve user info from localStorage if available
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo && !userInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, [setUserInfo, userInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedInfo = { ...userInfo || {}, [name]: value };
    setUserInfo(updatedInfo);
    
    // Save to localStorage
    localStorage.setItem('userInfo', JSON.stringify(updatedInfo));
  };
  
  const validateUserInfo = () => {
    if (!userInfo?.firstName || !userInfo?.lastName || !userInfo?.employeeId) {
      setStatus({
        type: 'error',
        message: 'Please fill in all required fields (First Name, Last Name, Employee ID).'
      });
      return false;
    }
    return true;
  };

  const handleCheckIn = async () => {
    if (!validateUserInfo()) return;
    if (lastCheckIn) {
      setStatus({
        type: 'error',
        message: 'You are already checked in. Please check out first.'
      });
      return;
    }
    
    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Checking in...' });
    
    try {
      // Request location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            
            // Submit check-in data
            const result = await submitTimeLog({
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              employeeId: userInfo.employeeId,
              deviceName: userInfo.deviceName || 'Unknown Device',
              action: 'Check In',
              ...locationData
            });
            
            if (result.success) {
              // Save check-in time
              const checkInTime = Date.now();
              localStorage.setItem('lastCheckIn', checkInTime.toString());
              setLastCheckIn(checkInTime);
              
              setStatus({
                type: 'success',
                message: `Checked in successfully at ${new Date().toLocaleTimeString()}`
              });
              setDuration(null);
              
              // Update location in parent component
              if (onLogAction) {
                onLogAction();
              }
            } else {
              setStatus({
                type: 'error',
                message: result.message
              });
            }
            setIsSubmitting(false);
          },
          (error) => {
            console.error("Error getting location:", error);
            setStatus({
              type: 'error',
              message: `Failed to get location: ${error.message}`
            });
            setIsSubmitting(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setStatus({
          type: 'error',
          message: 'Geolocation is not supported by your browser'
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      setIsSubmitting(false);
    }
  };
  
  const handleCheckOut = async () => {
    if (!validateUserInfo()) return;
    if (!lastCheckIn) {
      setStatus({
        type: 'error',
        message: 'You must check in before checking out'
      });
      return;
    }
    
    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Checking out...' });
    
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            
            const checkOutTime = Date.now();
            const durationStr = calculateDuration(lastCheckIn, checkOutTime);
            setDuration(durationStr);
            
            // Submit check-out data
            const result = await submitTimeLog({
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              employeeId: userInfo.employeeId,
              deviceName: userInfo.deviceName || 'Unknown Device',
              action: 'Check Out',
              duration: durationStr,
              ...locationData
            });
            
            if (result.success) {
              setStatus({
                type: 'success',
                message: `Checked out successfully at ${new Date().toLocaleTimeString()}. Duration: ${durationStr}`
              });
              
              // Clear last check-in
              localStorage.removeItem('lastCheckIn');
              setLastCheckIn(null);
              
              // Update location in parent component
              if (onLogAction) {
                onLogAction();
              }
            } else {
              setStatus({
                type: 'error',
                message: result.message
              });
            }
            setIsSubmitting(false);
          },
          (error) => {
            setStatus({
              type: 'error',
              message: `Failed to get location: ${error.message}`
            });
            setIsSubmitting(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setStatus({
          type: 'error',
          message: 'Geolocation is not supported by your browser'
        });
        setIsSubmitting(false);
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 slide-in">
      <section>
        <h2 className="text-lg font-semibold mb-3">1. Your Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">First Name*</label>
            <input
              type="text"
              name="firstName"
              value={userInfo?.firstName || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name*</label>
            <input
              type="text"
              name="lastName"
              value={userInfo?.lastName || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              placeholder="Enter last name"
              required
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-1">Employee ID*</label>
          <input
            type="text"
            name="employeeId"
            value={userInfo?.employeeId || ''}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
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
            className="w-full border rounded p-2"
            placeholder="Optional"
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">2. Clock In / Out</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCheckIn}
            disabled={isSubmitting || !!lastCheckIn}
            className={`
              bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center justify-center
              ${(isSubmitting || !!lastCheckIn) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="mr-2">✓</span> CHECK IN
          </button>
          <button
            onClick={handleCheckOut}
            disabled={isSubmitting || !lastCheckIn}
            className={`
              bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center
              ${(isSubmitting || !lastCheckIn) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <span className="mr-2">✗</span> CHECK OUT
          </button>
        </div>
        
        {status.type && (
          <div className={`mt-4 p-3 rounded ${
            status.type === 'success' ? 'bg-green-100 text-green-800' :
            status.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {status.message}
          </div>
        )}
        
        {duration && (
          <div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded">
            <strong>Work Duration:</strong> {duration}
          </div>
        )}
        
        {lastCheckIn && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
            <strong>Currently Checked In:</strong> {new Date(lastCheckIn).toLocaleString()}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Location Information</h2>
        <p className="text-sm text-green-600 flex items-center">
          <span className="mr-2">●</span> Location will be captured on check-in/out.
        </p>
        {location && location.latitude && (
          <div className="text-sm mt-2">
            <div>Latitude: {location.latitude}</div>
            <div>Longitude: {location.longitude}</div>
            <div>Accuracy: {location.accuracy ? `${location.accuracy} meters` : '-'}</div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TimePanel;
