import React, { useState } from 'react';

interface AbsencePanelProps {
  userInfo: any;
  onAddAbsence: () => void;
}

const AbsencePanel: React.FC<AbsencePanelProps> = ({ userInfo, onAddAbsence }) => {
  const [absenceData, setAbsenceData] = useState({
    date: '',
    type: '',
    reason: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAbsenceData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!userInfo?.firstName || !userInfo?.lastName || !userInfo?.employeeId) {
      alert('Please fill in your information in the Time tab first');
      return;
    }

    if (!absenceData.date || !absenceData.type) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real app, we would send this to an API
    console.log('Absence submitted:', { ...absenceData, user: userInfo });
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setAbsenceData({ date: '', type: '', reason: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-lg font-semibold">Report Absence</h2>
      
      {submitted ? (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          Your absence has been submitted successfully!
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm mb-1">Absence Date*</label>
            <input 
              type="date" 
              name="date"
              value={absenceData.date}
              onChange={handleChange}
              className="w-full border rounded p-2" 
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Absence Type*</label>
            <select 
              name="type"
              value={absenceData.type}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            >
              <option value="">Select type</option>
              <option value="sick">Sick</option>
              <option value="transportation">Transportation Issue</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Reason (Optional)</label>
            <textarea 
              name="reason"
              value={absenceData.reason}
              onChange={handleChange}
              className="w-full border rounded p-2 h-24" 
              placeholder="Enter details about your absence"
            ></textarea>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Submit Absence Request
          </button>
        </div>
      )}
    </div>
  );
};

export default AbsencePanel;
