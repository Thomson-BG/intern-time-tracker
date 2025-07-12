import React, { useState, useEffect } from 'react';

interface SmartNotification {
  id: string;
  type: 'reminder' | 'warning' | 'info' | 'break';
  message: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  action?: () => void;
  actionText?: string;
}

interface SmartNotificationsProps {
  isCheckedIn: boolean;
  onTakeBreak?: () => void;
}

const SmartNotifications: React.FC<SmartNotificationsProps> = ({ isCheckedIn, onTakeBreak }) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [lastBreakTime, setLastBreakTime] = useState<Date | null>(null);

  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Only show work-related notifications if checked in
      if (isCheckedIn) {
        // Break reminder (every 2 hours)
        if (lastBreakTime) {
          const timeSinceBreak = now.getTime() - lastBreakTime.getTime();
          const hoursSinceBreak = timeSinceBreak / (1000 * 60 * 60);
          
          if (hoursSinceBreak >= 2) {
            setNotifications(prev => {
              const existingBreakReminder = prev.find(n => n.type === 'break');
              if (!existingBreakReminder) {
                return [...prev, {
                  id: `break-${Date.now()}`,
                  type: 'break',
                  message: 'You\'ve been working for 2+ hours. Time for a break!',
                  timestamp: now.toISOString(),
                  priority: 'medium',
                  action: () => {
                    setLastBreakTime(new Date());
                    onTakeBreak?.();
                  },
                  actionText: 'Take Break'
                }];
              }
              return prev;
            });
          }
        } else {
          // First break reminder after 2 hours of work
          setLastBreakTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)); // Set 2 hours ago initially
        }

        // End of day reminder
        if (currentHour === 17 && currentMinute === 0) {
          setNotifications(prev => [...prev, {
            id: `end-day-${Date.now()}`,
            type: 'reminder',
            message: 'Work day is ending. Don\'t forget to check out!',
            timestamp: now.toISOString(),
            priority: 'high'
          }]);
        }

        // Productivity tips throughout the day
        if (currentMinute === 30 && [10, 14].includes(currentHour)) {
          const tips = [
            'Stay hydrated! Drink some water.',
            'Take a moment to stretch your muscles.',
            'Focus on your breathing for better concentration.',
            'Organize your workspace for better productivity.'
          ];
          const randomTip = tips[Math.floor(Math.random() * tips.length)];
          
          setNotifications(prev => [...prev, {
            id: `tip-${Date.now()}`,
            type: 'info',
            message: `💡 Productivity Tip: ${randomTip}`,
            timestamp: now.toISOString(),
            priority: 'low'
          }]);
        }
      }

      // General work start reminder (whether checked in or not)
      if (currentHour === 8 && currentMinute === 45) {
        setNotifications(prev => [...prev, {
          id: `start-reminder-${Date.now()}`,
          type: 'reminder',
          message: 'Work starts in 15 minutes. Don\'t forget to check in!',
          timestamp: now.toISOString(),
          priority: 'medium'
        }]);
      }
    };

    // Check immediately and then every minute
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);
    
    return () => clearInterval(interval);
  }, [isCheckedIn, lastBreakTime, onTakeBreak]);

  // Auto-dismiss notifications after 30 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.priority !== 'high') {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 30000);
      }
    });
  }, [notifications]);

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return 'fa-bell';
      case 'warning': return 'fa-exclamation-triangle';
      case 'break': return 'fa-coffee';
      case 'info': return 'fa-lightbulb';
      default: return 'fa-info-circle';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-white/20 bg-white/5';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`glass-dark rounded-lg p-4 border shadow-lg slide-in ${getPriorityColor(notification.priority)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="text-white text-lg pt-1">
              <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">{notification.message}</p>
              <p className="text-white/60 text-xs mt-1">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex flex-col space-y-1">
              {notification.action && notification.actionText && (
                <button
                  onClick={notification.action}
                  className="btn-glass text-white text-xs py-1 px-2 rounded"
                >
                  {notification.actionText}
                </button>
              )}
              <button
                onClick={() => dismissNotification(notification.id)}
                className="text-white/70 hover:text-white text-sm"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SmartNotifications;