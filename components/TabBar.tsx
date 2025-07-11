import React from 'react';
import { Tab } from '../types/Tab';

interface TabBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: Tab.Time,      label: 'Time Tracking', icon: 'fa-clock' },
    { id: Tab.Absence,   label: 'Absence Request', icon: 'fa-calendar-times' },
    { id: Tab.Timesheet, label: 'My Timesheet', icon: 'fa-table' },
  ];

  return (
    <div className="flex space-x-2 mb-6">
      {tabs.map(({ id, label, icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={[
            'py-3 px-6 font-semibold rounded-lg transition-all duration-300 flex items-center space-x-2',
            activeTab === id
              ? 'glass-light text-white border-white/30 shadow-lg transform scale-105'
              : 'glass text-white/70 hover:text-white hover:glass-light',
          ].join(' ')}
        >
          <i className={`fas ${icon}`}></i>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabBar;
