import React from 'react';

interface StatusDisplayProps {
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp?: string;
}

const getStyles = (type: StatusDisplayProps['type']) => {
  switch (type) {
    case 'success':
      return 'status-success text-green-100';
    case 'error':
      return 'status-error text-red-100';
    case 'info':
    default:
      return 'status-info text-blue-100';
  }
};

const getIcon = (type: StatusDisplayProps['type']) => {
  switch (type) {
    case 'success':
      return 'fa-check-circle';
    case 'error':
      return 'fa-exclamation-circle';
    case 'info':
    default:
      return 'fa-info-circle';
  }
};

const StatusDisplay: React.FC<StatusDisplayProps> = ({ type, message, timestamp }) => (
  <div className={`p-4 mb-6 rounded-lg ${getStyles(type)} animate-fadeIn shadow-lg`}>
    <div className="flex items-start space-x-3">
      <i className={`fas ${getIcon(type)} text-xl mt-1`}></i>
      <div className="flex-1">
        <div className="font-medium text-white">{message}</div>
        {timestamp && (
          <div className="text-sm text-white/80 mt-1">
            {timestamp}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default StatusDisplay;
