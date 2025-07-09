import React from 'react';

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
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo({ ...userInfo, [name]: value });
  };

  return (
    <div className="space-y-6 slide-in">
      <section>
        <h2 className="text-lg font-semibold mb-3">1. Your Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={userInfo?.firstName || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={userInfo?.lastName || ''}
              onChange={handleInputChange}
              className="w-full border rounded p-2"
              placeholder="Enter last name"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-1">Employee ID</label>
          <input
            type="text"
            name="employeeId"
            value={userInfo?.employeeId || ''}
            onChange={handleInputChange}
            className="w-full border rounded p-2"
            placeholder="Enter employee ID"
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
            onClick={onLogAction}
            disabled={isLogging || !userInfo}
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center justify-center"
          >
            <span className="mr-2">✓</span> CHECK IN
          </button>
          <button
            onClick={onLogAction}
            disabled={isLogging || !userInfo}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center"
          >
            <span className="mr-2">✗</span> CHECK OUT
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Location Information</h2>
        <p className="text-sm text-green-600 flex items-center">
          <span className="mr-2">●</span> Location will be captured on check-in/out.
        </p>
        {location && (
          <div className="text-sm mt-2">
            <div>Latitude: {location.latitude || '-'}</div>
            <div>Longitude: {location.longitude || '-'}</div>
            <div>Accuracy: {location.accuracy ? `${location.accuracy} meters` : '-'}</div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TimePanel;
