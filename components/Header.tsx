import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="bg-csea-navy text-white p-6 rounded-t-xl">
      <div className="text-center">
        {/* CSEA Logo placeholder - in a real app, this would be an image */}
        <div className="mb-2">
          <div className="text-2xl font-bold text-csea-yellow">CSEA</div>
          <div className="text-xs">California School Employee Association</div>
        </div>
        <h1 className="text-lg font-semibold">Employee Time & Absence Tracker</h1>
        <p className="text-sm text-gray-300 mt-1">Record your hours, absences, and view your timesheet</p>
      </div>
    </div>
  );
};

export default Header;
