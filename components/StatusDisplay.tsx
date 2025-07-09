import React from 'react';

interface StatusDisplayProps {
  type: 'success' | 'error' | 'info';
  title: string;
  details: string;
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

const StatusDisplay: React.FC<StatusDisplayProps> = ({ type, title, details }) => (
  <div className={`border-l-4 p-4 mb-4 ${getColor(type)}`}>
    <div className="font-bold">{title}</div>
    <div>{details}</div>
  </div>
);

export default StatusDisplay;
