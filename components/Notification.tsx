import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  onClose, 
  autoClose = true, 
  duration = 4000 
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'status-success';
      case 'error':
        return 'status-error';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/40';
      case 'info':
      default:
        return 'status-info';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-triangle';
      case 'warning':
        return 'fa-exclamation-circle';
      case 'info':
      default:
        return 'fa-info-circle';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80 max-w-md ${getStyles()} animate-fadeIn`}>
      <i className={`fas ${getIcon()} text-white text-lg`}></i>
      <span className="text-white flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Notification;