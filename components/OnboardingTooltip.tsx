import React, { useState, useEffect } from 'react';

interface OnboardingTooltipProps {
  id: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ 
  id, 
  title, 
  content, 
  position = 'top', 
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Check if this tooltip has been dismissed before
    const completed = localStorage.getItem(`tooltip-${id}-completed`);
    if (completed) {
      setIsCompleted(true);
    } else {
      // Show tooltip after a short delay for first-time users
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsCompleted(true);
    localStorage.setItem(`tooltip-${id}-completed`, 'true');
  };

  if (isCompleted) {
    return <>{children}</>;
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      {children}
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]} animate-fadeIn`}>
          <div className="glass-card p-4 rounded-lg border border-purple-500/30 max-w-xs shadow-2xl">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-purple-300 font-semibold text-sm">{title}</h4>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white transition-colors ml-2"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            <p className="text-gray-300 text-xs leading-relaxed mb-3">{content}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-purple-400 text-xs">
                <i className="fas fa-lightbulb mr-1"></i>
                Tip for Students
              </div>
              <button
                onClick={handleDismiss}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingTooltip;