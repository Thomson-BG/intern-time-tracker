import React from 'react';

const Header: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-lg text-white p-6 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center glass border border-white/30">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              SBRA - School Bus Reporting Application
            </span>
          </h1>
          <p className="text-purple-200/80 text-sm mt-1">Professional time and absence management for high school interns</p>
        </div>
        <div className="text-right text-purple-200/70">
          <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
          <p className="text-xs opacity-80">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
