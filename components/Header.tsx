import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            Bulldog Garage Time Tracker
          </h1>
          <p className="text-blue-100 text-sm mt-1">Professional time and absence management system</p>
        </div>
        <div className="text-right text-blue-100">
          <p className="text-sm">Today: {new Date().toLocaleDateString()}</p>
          <p className="text-xs">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
