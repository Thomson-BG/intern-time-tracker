import React from 'react';

interface StatusDisplayProps {
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp?: string;
}

const getColor = (type: StatusDisplayProps['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-100 text-green-700 border-green-400';
    case 'error':
      return 'bg-red-100 text-red-700 border-red-400';
    case 'info':
    default:
      return 'bg-blue-100 text-blue-700 border-blue-400';
  }
};

const getIcon = (type: StatusDisplayProps['type']) => {
  switch (type) {
    case 'success':
      return '✓';
    case 'error':
      return '✗';
    case 'info':
    default:
      return 'ℹ';
  }
};

const StatusDisplay: React.FC<StatusDisplayProps> = ({ type, message, timestamp }) => (
  <div className={`border-l-4 p-4 mb-4 rounded-r-lg ${getColor(type)} animate-fadeIn`}>
    <div className="flex items-start">
      <span className="mr-2 text-lg">{getIcon(type)}</span>
      <div className="flex-1">
        <div className="font-medium">{message}</div>
        {timestamp && (
          <div className="text-sm opacity-75 mt-1">
            {timestamp}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default StatusDisplay;
