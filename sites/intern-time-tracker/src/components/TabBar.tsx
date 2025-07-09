import React from 'react';
import { Tab } from '../types';

interface TabBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, setActiveTab }) => {
  // Add console.log to debug
  const handleTabClick = (tab: Tab) => {
    console.log("Tab clicked:", tab);
    setActiveTab(tab);
  };

  return (
    <div className="flex space-x-2 mb-4">
      <button 
        onClick={() => handleTabClick(Tab.Time)}
        className={`px-4 py-2 rounded-md ${activeTab === Tab.Time ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
      >
        Time
      </button>
      <button 
        onClick={() => handleTabClick(Tab.Absence)}
        className={`px-4 py-2 rounded-md ${activeTab === Tab.Absence ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
      >
        Absence
      </button>
      <button 
        onClick={() => handleTabClick(Tab.Timesheet)}
        className={`px-4 py-2 rounded-md ${activeTab === Tab.Timesheet ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
      >
        Timesheet
      </button>
    </div>
  );
};

export default TabBar;
