import React from 'react';
import { Tab } from '../types/Tab';

interface TabBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { 
      id: Tab.Time, 
      label: 'Time Tracking', 
      icon: 'fa-clock',
      description: 'Check in/out and track hours'
    },
    { 
      id: Tab.Absence, 
      label: 'Report Absence', 
      icon: 'fa-calendar-times',
      description: 'Submit absence requests'
    },
    { 
      id: Tab.Timesheet, 
      label: 'My Timesheet', 
      icon: 'fa-file-alt',
      description: 'View and download records'
    },
  ];

  return (
    <div className="mb-6">
      <div className="border-b border-white/20">
        <nav className="-mb-px flex space-x-1">
          {tabs.map(({ id, label, icon, description }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={[
                'group relative inline-flex items-center px-6 py-3 border-b-2 font-medium text-sm transition-all duration-200 rounded-t-lg',
                activeTab === id
                  ? 'border-purple-400 text-purple-300 glass'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-white/30 hover:bg-white/5',
              ].join(' ')}
            >
              <i className={`fas ${icon} mr-2`}></i>
              {label}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 glass-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {description}
              </div>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TabBar;
