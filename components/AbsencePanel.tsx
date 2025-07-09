import React, { useState } from 'react';
import { submitAbsenceLog } from '../utils/apiService';

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
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAbsenceData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!userInfo?.firstName || !userInfo?.lastName || !userInfo?.employeeId) {
      setStatus({
        type: 'error',
        message: 'Please fill in your information in the Time tab first'
      });
      return false;
    }

    if (!absenceData.date || !absenceData.type) {
      setStatus({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Submitting absence...' });
    
    try {
      const result = await submitAbsenceLog({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        employeeId: userInfo.employeeId,
        deviceName: userInfo.deviceName || 'Unknown Device',
        date: absenceData.date,
        type: absenceData.type,
        reason: absenceData.reason || 'No reason provided'
      });
      
      if (result.success) {
        setStatus({
          type: 'success',
          message: 'Your absence has been submitted successfully!'
        });
        
        // Clear form after successful submission
        setAbsenceData({ date: '', type: '', reason: '' });
        
        // Notify parent component
        if (onAddAbsence) {
          onAddAbsence();
        }
      } else {
        setStatus({
          type: 'error',
          message: result.message
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-lg font-semibold">Report Absence</h2>
      
      {status.type && (
        <div className={`p-3 rounded ${
          status.type === 'success' ? 'bg-green-100 text-green-800' :
          status.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {status.message}
        </div>
      )}
      
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
          disabled={isSubmitting}
          className={`
            bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Absence Request'}
        </button>
      </div>
    </div>
  );
};

export default AbsencePanel;
