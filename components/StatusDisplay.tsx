import React from 'react';

interface StatusDisplayProps {
  type: 'success' | 'error' | 'info';
  message: string;
  timestamp?: string;
}

const getColor = (type: StatusDisplayProps['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'error':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'info':
    default:
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  }
};

const getIcon = (type: StatusDisplayProps['type']) => {
  switch (type) {
    case 'success':
      return 'fa-check-circle text-green-400';
    case 'error':
      return 'fa-exclamation-circle text-red-400';
    case 'info':
    default:
      return 'fa-info-circle text-blue-400';
  }
};

const StatusDisplay: React.FC<StatusDisplayProps> = ({ type, message, timestamp }) => (
  <div className={`border-l-4 p-4 mb-6 rounded-r-lg glass backdrop-blur-sm ${getColor(type)} animate-slideIn`}>
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
