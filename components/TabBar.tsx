import React from 'react';
import { Tab } from '../types/Tab';

interface TabBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: Tab.Time,      label: 'Home', icon: '🏠' },
    { id: Tab.Absence,   label: 'Forms', icon: '📋' },
    { id: Tab.Timesheet, label: 'Document', icon: '📄' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-csea-navy border-t border-gray-600">
      <div className="max-w-3xl mx-auto flex justify-around py-2">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={[
              'flex flex-col items-center py-2 px-4 min-w-0 flex-1 transition-colors',
              activeTab === id
                ? 'text-csea-yellow'
                : 'text-white hover:text-csea-yellow',
            ].join(' ')}
          >
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-xs font-medium">{label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabBar;
