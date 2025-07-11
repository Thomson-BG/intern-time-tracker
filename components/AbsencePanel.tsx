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
      <section className="glass-card p-6 rounded-lg border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <i className="fas fa-calendar-times text-purple-400"></i>
          Report Absence
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="absenceDate" className="block text-sm font-medium text-gray-300 mb-1">
                Absence Date <span className="text-red-400">*</span>
              </label>
              <input 
                id="absenceDate"
                type="date" 
                value={absenceDate}
                onChange={(e) => setAbsenceDate(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors backdrop-blur-sm"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label htmlFor="absenceType" className="block text-sm font-medium text-gray-300 mb-1">
                Absence Type <span className="text-red-400">*</span>
              </label>
              <select 
                id="absenceType"
                value={absenceType}
                onChange={(e) => setAbsenceType(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors backdrop-blur-sm"
                required
                disabled={isSubmitting}
              >
                <option value="" className="bg-gray-800 text-white">Select type</option>
                <option value="Sick" className="bg-gray-800 text-white">Sick</option>
                <option value="Emergency" className="bg-gray-800 text-white">Emergency</option>
                <option value="Medical Appointment" className="bg-gray-800 text-white">Medical Appointment</option>
                <option value="Other" className="bg-gray-800 text-white">Other</option>
              </select>
            </div>
          
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-1">
              Reason (Optional)
            </label>
            <textarea 
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-md p-3 h-24 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors backdrop-blur-sm" 
              placeholder="Enter details about your absence (optional)"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="glass p-4 rounded-lg border border-white/20">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Employee Information</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p><span className="font-medium text-white">Name:</span> {userInfo.firstName} {userInfo.lastName}</p>
              <p><span className="font-medium text-white">Employee ID:</span> {userInfo.employeeId}</p>
              {userInfo.deviceName && <p><span className="font-medium text-white">Device:</span> {userInfo.deviceName}</p>}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || !userInfo.firstName || !userInfo.lastName || !userInfo.employeeId}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover-lift"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting Request...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-1"></i>
                Submit Absence Request
              </>
            )}
          </button>
        </div>
      </form>
      </section>
    </div>
  );
};

export default AbsencePanel;
