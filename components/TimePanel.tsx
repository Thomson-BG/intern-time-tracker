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
      {/* Hero Section */}
      <section className="bg-csea-yellow p-6 rounded-lg -mx-6 mb-6">
        <h2 className="text-xl font-bold text-csea-navy mb-2">California School Employee</h2>
        <p className="text-csea-navy">Track your working hours and manage your time efficiently with our employee portal.</p>
      </section>

      {/* Information Card */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-csea-navy">Your Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2 text-csea-medium-gray font-medium">First Name</label>
            <input
              type="text"
              name="firstName"
              value={userInfo?.firstName || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-csea-yellow focus:border-csea-yellow transition-colors"
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-csea-medium-gray font-medium">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={userInfo?.lastName || ''}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-csea-yellow focus:border-csea-yellow transition-colors"
              placeholder="Enter last name"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-2 text-csea-medium-gray font-medium">Employee ID</label>
          <input
            type="text"
            name="employeeId"
            value={userInfo?.employeeId || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-csea-yellow focus:border-csea-yellow transition-colors"
            placeholder="Enter employee ID"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm mb-2 text-csea-medium-gray font-medium">Device Name (e.g., My Phone, Lab PC)</label>
          <input
            type="text"
            name="deviceName"
            value={userInfo?.deviceName || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-csea-yellow focus:border-csea-yellow transition-colors"
            placeholder="Optional"
          />
        </div>
      </section>

      {/* Clock In/Out Card */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-csea-navy">Clock In / Out</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onLogAction}
            disabled={isLogging || !userInfo}
            className="bg-csea-yellow hover:bg-yellow-400 text-csea-navy py-3 px-6 rounded-lg flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-2">✓</span> CHECK IN
          </button>
          <button
            onClick={onLogAction}
            disabled={isLogging || !userInfo}
            className="bg-csea-navy hover:bg-blue-800 text-white py-3 px-6 rounded-lg flex items-center justify-center font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="mr-2">✗</span> CHECK OUT
          </button>
        </div>
      </section>

      {/* Location Information Card */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-3 text-csea-navy">Location Information</h2>
        <p className="text-sm text-csea-medium-gray flex items-center">
          <span className="mr-2 text-csea-yellow">●</span> Location will be captured on check-in/out.
        </p>
        {location && (
          <div className="text-sm mt-4 bg-csea-light-gray p-3 rounded-lg">
            <div className="text-csea-medium-gray">Latitude: {location.latitude || '-'}</div>
            <div className="text-csea-medium-gray">Longitude: {location.longitude || '-'}</div>
            <div className="text-csea-medium-gray">Accuracy: {location.accuracy ? `${location.accuracy} meters` : '-'}</div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TimePanel;
