import React, { useState, useEffect } from 'react';

interface ProductivityReminderProps {
  isCheckedIn: boolean;
  lastCheckInTime?: string;
}

const ProductivityReminder: React.FC<ProductivityReminderProps> = ({ 
  isCheckedIn, 
  lastCheckInTime 
}) => {
  const [reminder, setReminder] = useState<{
    message: string;
    type: 'info' | 'warning' | 'success';
    show: boolean;
  } | null>(null);

  useEffect(() => {
    if (!isCheckedIn) {
      setReminder(null);
      return;
    }

    // Set up reminders for break time and end of day
    const checkReminders = () => {
      if (!lastCheckInTime) return;

      const checkInTime = new Date(lastCheckInTime);
      const now = new Date();
      const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

      if (hoursWorked >= 4 && hoursWorked < 4.5) {
        setReminder({
          message: 'Consider taking a break! You\'ve been working for 4+ hours.',
          type: 'info',
          show: true
        });
      } else if (hoursWorked >= 8) {
        setReminder({
          message: 'Great work today! You\'ve completed a full 8-hour day.',
          type: 'success',
          show: true
        });
      } else if (hoursWorked >= 6 && hoursWorked < 8) {
        setReminder({
          message: 'You\'re doing great! Consider wrapping up in the next couple hours.',
          type: 'info',
          show: true
        });
      }
    };

    // Check every 30 minutes
    const interval = setInterval(checkReminders, 30 * 60 * 1000);
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [isCheckedIn, lastCheckInTime]);

  if (!reminder?.show) return null;

  return (
    <div className={`mt-4 p-4 rounded-lg border-l-4 ${
      reminder.type === 'success' ? 'glass border-green-400' :
      reminder.type === 'warning' ? 'glass border-yellow-400' :
      'glass border-blue-400'
    }`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <i className={`fas ${
            reminder.type === 'success' ? 'fa-check-circle text-green-400' :
            reminder.type === 'warning' ? 'fa-exclamation-triangle text-yellow-400' :
            'fa-info-circle text-blue-400'
          }`}></i>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-white">{reminder.message}</p>
          <button
            onClick={() => setReminder({ ...reminder, show: false })}
            className="mt-2 text-xs text-white/70 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductivityReminder;