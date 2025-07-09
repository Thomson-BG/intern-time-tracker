import React from 'react';
import { Tab } from '../types';

interface TabBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const tabs: { label: string; value: Tab }[] = [
  { label: 'Time', value: Tab.Time },
  { label: 'Absence', value: Tab.Absence },
  { label: 'Timesheet', value: Tab.Timesheet },
];

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => (
  <div className="flex space-x-2 mb-6">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        className={`px-4 py-2 rounded-md font-semibold ${
          activeTab === tab.value
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={() => setActiveTab(tab.value)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default TabBar;
