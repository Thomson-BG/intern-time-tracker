import React from 'react';

interface AbsencePanelProps {
  userInfo: any;
  onAddAbsence: () => void;
}

const AbsencePanel: React.FC<AbsencePanelProps> = ({ userInfo, onAddAbsence }) => {
  return (
    <div className="space-y-6 slide-in">
      {/* Hero Section */}
      <section className="bg-csea-yellow p-6 rounded-lg -mx-6 mb-6">
        <h2 className="text-xl font-bold text-csea-navy mb-2">Absence Request Forms</h2>
        <p className="text-csea-navy">Submit your absence requests and manage your leave efficiently through our portal.</p>
      </section>

      {/* Absence Form Card */}
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-csea-navy">Report Absence</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-csea-medium-gray font-medium">Absence Date</label>
            <input 
              type="date" 
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-csea-yellow focus:border-csea-yellow transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-csea-medium-gray font-medium">Absence Type</label>
            <select className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-csea-yellow focus:border-csea-yellow transition-colors">
              <option value="">Select type</option>
              <option value="sick">Sick Leave</option>
              <option value="vacation">Vacation</option>
              <option value="personal">Personal Leave</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2 text-csea-medium-gray font-medium">Reason (Optional)</label>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-3 h-24 focus:ring-2 focus:ring-csea-yellow focus:border-csea-yellow transition-colors" 
              placeholder="Enter details about your absence"
            ></textarea>
          </div>
          <button
            onClick={onAddAbsence}
            disabled={!userInfo}
            className="bg-csea-yellow hover:bg-yellow-400 text-csea-navy py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            Submit Absence Request
          </button>
        </div>
      </section>

      {/* Information Card */}
      <section className="bg-csea-navy text-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3 text-csea-yellow">Important Information</h3>
        <ul className="text-sm space-y-2">
          <li className="flex items-start">
            <span className="text-csea-yellow mr-2">•</span>
            Submit absence requests at least 24 hours in advance when possible
          </li>
          <li className="flex items-start">
            <span className="text-csea-yellow mr-2">•</span>
            Emergency absences should be reported as soon as possible
          </li>
          <li className="flex items-start">
            <span className="text-csea-yellow mr-2">•</span>
            Contact your supervisor for urgent matters
          </li>
        </ul>
      </section>
    </div>
  );
};

export default AbsencePanel;
