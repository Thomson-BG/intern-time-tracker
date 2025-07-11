import React, { useState } from 'react';
import { submitAbsence, AbsenceEntry } from '../utils/timeTrackerApi';

interface AbsencePanelProps {
  userInfo: any;
  onAddAbsence: (absenceData: any) => void;
  onStatusUpdate?: (status: { message: string; type: 'success' | 'error' | 'info' }) => void;
}

const AbsencePanel: React.FC<AbsencePanelProps> = ({ userInfo, onAddAbsence, onStatusUpdate }) => {
  const [absenceDate, setAbsenceDate] = useState('');
  const [absenceType, setAbsenceType] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!userInfo.firstName || !userInfo.lastName || !userInfo.employeeId) {
      onStatusUpdate?.({
        message: 'Please fill in your personal information in the Time tab first',
        type: 'error'
      });
      return;
    }

    if (!absenceDate || !absenceType) {
      onStatusUpdate?.({
        message: 'Please fill in all required fields (Date and Type)',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the reason to include absence type as requested: "Absence Type - Reason"
      const formattedReason = reason.trim() 
        ? `${absenceType} - ${reason.trim()}`
        : absenceType;

      const absenceEntry: AbsenceEntry = {
        type: 'absencelog',
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        employeeId: userInfo.employeeId,
        deviceName: userInfo.deviceName || 'Unknown Device',
        date: absenceDate,
        absenceType: absenceType,
        reason: formattedReason, // This will be stored in column F as "Absence Type - Reason"
        submitted: new Date().toISOString()
      };

      const result = await submitAbsence(absenceEntry);
      
      // Call the parent callback with the absence data
      onAddAbsence(absenceEntry);
      
      // Show success message
      onStatusUpdate?.({
        message: `Absence request submitted successfully for ${absenceDate}. Google Sheets: ${result}`,
        type: 'success'
      });

      // Clear the form
      setAbsenceDate('');
      setAbsenceType('');
      setReason('');

    } catch (error) {
      console.error('Error submitting absence:', error);
      onStatusUpdate?.({
        message: `Failed to submit absence request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="space-y-6 slide-in">
      <h2 className="text-lg font-semibold text-gray-900">Report Absence</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="absenceDate" className="block text-sm font-medium text-gray-700 mb-1">
              Absence Date <span className="text-red-500">*</span>
            </label>
            <input 
              id="absenceDate"
              type="date" 
              value={absenceDate}
              onChange={(e) => setAbsenceDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="absenceType" className="block text-sm font-medium text-gray-700 mb-1">
              Absence Type <span className="text-red-500">*</span>
            </label>
            <select 
              id="absenceType"
              value={absenceType}
              onChange={(e) => setAbsenceType(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              disabled={isSubmitting}
            >
              <option value="">Select type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Vacation">Vacation</option>
              <option value="Personal Leave">Personal Leave</option>
              <option value="Emergency">Emergency</option>
              <option value="Medical Appointment">Medical Appointment</option>
              <option value="Bereavement">Bereavement</option>
              <option value="Jury Duty">Jury Duty</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea 
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-3 h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              placeholder="Enter details about your absence (optional)"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Employee Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Name:</span> {userInfo.firstName} {userInfo.lastName}</p>
              <p><span className="font-medium">Employee ID:</span> {userInfo.employeeId}</p>
              {userInfo.deviceName && <p><span className="font-medium">Device:</span> {userInfo.deviceName}</p>}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !userInfo.firstName || !userInfo.lastName || !userInfo.employeeId}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting Request...
              </>
            ) : (
              'Submit Absence Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AbsencePanel;
