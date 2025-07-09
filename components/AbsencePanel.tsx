import React from 'react';

interface AbsencePanelProps {
  userInfo: any;
  onAddAbsence: () => void;
}

const AbsencePanel: React.FC<AbsencePanelProps> = ({ userInfo, onAddAbsence }) => {
  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-lg font-semibold">Report Absence</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm mb-1">Absence Date</label>
          <input type="date" className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Absence Type</label>
          <select className="w-full border rounded p-2">
            <option value="">Select type</option>
            <option value="sick">Sick Leave</option>
            <option value="vacation">Vacation</option>
            <option value="personal">Personal Leave</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Reason (Optional)</label>
          <textarea className="w-full border rounded p-2 h-24" placeholder="Enter details about your absence"></textarea>
        </div>
        <button
          onClick={onAddAbsence}
          disabled={!userInfo}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Submit Absence Request
        </button>
      </div>
    </div>
  );
};

export default AbsencePanel;
