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

  // Check if user info is filled
  const isUserInfoValid = userInfo?.firstName && userInfo?.lastName && userInfo?.employeeId;

  return (
    <div className="space-y-6 slide-in">
      <div className="card-glass rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
          <i className="fas fa-calendar-times mr-2"></i>
          Report Absence
        </h2>
        
        {!isUserInfoValid && (
          <div className="status-error rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-exclamation-triangle"></i>
              <span className="text-white font-medium">Please fill in your personal information in the Time Tracking tab first.</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-2 text-white/80">Absence Date *</label>
            <input 
              type="date" 
              className="w-full input-glass rounded-lg p-3 transition-all duration-300"
              value={absenceDate}
              onChange={(e) => setAbsenceDate(e.target.value)}
              disabled={!isUserInfoValid}
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-white/80">Absence Type *</label>
            <select 
              className="w-full input-glass rounded-lg p-3 transition-all duration-300"
              value={absenceType}
              onChange={(e) => setAbsenceType(e.target.value)}
              disabled={!isUserInfoValid}
            >
              <option value="">Select type</option>
              <option value="sick">Sick Leave</option>
              <option value="vacation">Vacation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-2 text-white/80">Reason (Optional)</label>
            <textarea 
              className="w-full input-glass rounded-lg p-3 h-24 transition-all duration-300 resize-none"
              placeholder="Enter details about your absence"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={!isUserInfoValid}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!isUserInfoValid || !absenceDate || !absenceType}
            className="btn-glass hover:glass-light text-white py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <i className="fas fa-paper-plane"></i>
            <span>Submit Absence</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbsencePanel;
