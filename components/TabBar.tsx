import React, { useState } from 'react';
import { Tab } from '../types';

interface TabBarProps {
  onChange?: (tab: Tab) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ onChange }) => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Time);

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    onChange?.(tab);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: Tab.Time, label: 'Time' },
    { id: Tab.Absence, label: 'Absence' },
    { id: Tab.Timesheet, label: 'Timesheet' },
  ];

  return (
    <div className="flex border-b border-gray-200 mb-6">
      {tabs.map(({ id, label }, i) => (
        <button
          key={id}
          onClick={() => handleTabClick(id)}
          className={[
            'py-2 px-4 font-semibold rounded-t-lg transition-colors',
            activeTab === id
              ? 'bg-blue-900 text-white'
              : 'bg-gray-100 hover:bg-gray-200',
            i > 0 ? 'ml-2' : '',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
