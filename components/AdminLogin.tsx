import React, { useState } from 'react';
import { validateCredentials } from '../utils/adminCredentialsApi';

interface AdminLoginProps {
  onLogin: (success: boolean, role?: 'Admin' | 'Manager', fullName?: string, email?: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      onLogin(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // First check hardcoded admin credentials for backward compatibility
      if (username === 'admin' && password === 'password') {
        onLogin(true, 'Admin', 'System Administrator', 'admin@system.local');
        return;
      }
      
      // Validate against Google Sheets Admin Credentials
      const result = await validateCredentials(username, password);
      
      if (result.success) {
        onLogin(true, result.role, result.fullName, result.email);
      } else {
        onLogin(false);
      }
    } catch (error) {
      console.error('Login validation error:', error);
      
      // Fallback to localStorage credentials if Google Sheets is unavailable
      try {
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        const adminMatch = admins.find((admin: any) => 
          admin.loginName === username && admin.password === password
        );
        
        if (adminMatch) {
          onLogin(true, 'Admin', adminMatch.name, adminMatch.email);
          return;
        }
        
        const managers = JSON.parse(localStorage.getItem('managers') || '[]');
        const managerMatch = managers.find((manager: any) => 
          manager.loginName === username && manager.password === password
        );
        
        if (managerMatch) {
          onLogin(true, 'Manager', managerMatch.name, managerMatch.email);
          return;
        }
        
        onLogin(false);
      } catch (fallbackError) {
        console.error('Fallback login error:', fallbackError);
        onLogin(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="card-glass rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <h2 className="font-bold mb-4 text-white text-lg flex items-center">
            <i className="fas fa-shield-alt mr-2"></i>
            Admin Access
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full input-glass rounded-lg p-3 transition-all duration-300"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full input-glass rounded-lg p-3 transition-all duration-300"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-glass hover:glass-light text-white px-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Access Admin Panel</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
