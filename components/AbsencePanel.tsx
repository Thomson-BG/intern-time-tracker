import React, { useState } from 'react';

interface AbsenceData {
  date: string;
  type: string;
  reason: string;
}

interface AbsencePanelProps {
  userInfo: any;
  onAddAbsence: (absenceData: AbsenceData) => void;
}

const AbsencePanel: React.FC<AbsencePanelProps> = ({ userInfo, onAddAbsence }) => {
  const [absenceDate, setAbsenceDate] = useState('');
  const [absenceType, setAbsenceType] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!absenceDate || !absenceType) {
      return; // Don't submit if required fields are missing
    }
    
    const absenceData: AbsenceData = {
      date: absenceDate,
      type: absenceType,
      reason: reason
    };
    
    onAddAbsence(absenceData);
    
    // Reset form after submission
    setAbsenceDate('');
    setAbsenceType('');
    setReason('');
  };

  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-lg font-semibold">Report Absence</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm mb-1">Absence Date</label>
          <input 
            type="date" 
            className="w-full border rounded p-2" 
            value={absenceDate}
            onChange={(e) => setAbsenceDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Absence Type</label>
          <select 
            className="w-full border rounded p-2"
            value={absenceType}
            onChange={(e) => setAbsenceType(e.target.value)}
          >
            <option value="">Select type</option>
            <option value="sick">Sick Leave</option>
            <option value="vacation">Vacation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Reason (Optional)</label>
          <textarea 
            className="w-full border rounded p-2 h-24" 
            placeholder="Enter details about your absence"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!userInfo || !absenceDate || !absenceType}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:bg-gray-400"
        >
          Submit Absence
        </button>
      </div>
    </div>
  );
};

export default AbsencePanel;
