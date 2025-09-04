import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="bg-blue-600 text-white p-4 rounded-t-xl">
      <h1 className="text-xl font-bold text-white">Bulldog Garage Intern Time & Absence Tracker</h1>
      <p className="text-sm font-bold text-white">Record your hours, absences, and view your timesheet</p>
    </div>
  );
};

export default Header;
