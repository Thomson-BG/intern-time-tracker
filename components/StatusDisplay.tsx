import React from 'react';

interface StatusDisplayProps {
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp?: string;
}

const getColor = (type: StatusDisplayProps['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'error':
      return 'bg-red-50 text-red-800 border-red-200';
    case 'info':
    default:
      return 'bg-blue-50 text-blue-800 border-blue-200';
  }
};

const getIcon = (type: StatusDisplayProps['type']) => {
  switch (type) {
    case 'success':
      return 'fa-check-circle text-green-500';
    case 'error':
      return 'fa-exclamation-circle text-red-500';
    case 'info':
    default:
      return 'fa-info-circle text-blue-500';
  }
};

const StatusDisplay: React.FC<StatusDisplayProps> = ({ type, message, timestamp }) => (
  <div className={`border-l-4 p-4 mb-6 rounded-r-lg shadow-sm ${getColor(type)} animate-slideIn`}>
    <div className="flex items-start">
      <i className={`fas ${getIcon(type)} mr-3 mt-0.5 text-lg`}></i>
      <div className="flex-1">
        <div className="font-medium leading-relaxed">{message}</div>
        {timestamp && (
          <div className="text-sm opacity-75 mt-2 flex items-center">
            <i className="fas fa-clock mr-1 text-xs"></i>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default StatusDisplay;
