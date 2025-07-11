import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="glass-light text-white p-6 rounded-t-2xl border-b border-white/20">
      <h1 className="text-2xl font-bold text-glow mb-2">Bulldog Garage Intern Time & Absence Tracker</h1>
      <p className="text-white/80 text-sm">Record your hours, absences, and view your timesheet</p>
    </div>
  );
};

export default Header;
