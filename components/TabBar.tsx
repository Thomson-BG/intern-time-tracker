import React from 'react';
import { Tab } from '../types/Tab';

interface TabBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: Tab.Time, label: 'Time' },
    { id: Tab.Absence, label: 'Absence' },
    { id: Tab.Timesheet, label: 'Timesheet' },
  ];

  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map(({ id, label }, i) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`py-2 px-4 font-medium ${
            activeTab === id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          } rounded-t-lg ${i > 0 ? 'ml-2' : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
