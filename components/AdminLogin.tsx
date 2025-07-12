import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (success: boolean, userRole?: 'admin' | 'manager', currentUser?: { employeeId: string; firstName: string; lastName: string }) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate authentication check with multiple user types
    try {
      // Simple hardcoded check for demonstration. In production, this would check against a database.
      if (username === 'admin' && password === 'password') {
        onLogin(true, 'admin', { employeeId: 'ADMIN001', firstName: 'System', lastName: 'Administrator' });
        setError('');
      } else if (username === 'manager' && password === 'manager123') {
        onLogin(true, 'manager', { employeeId: 'MGR001', firstName: 'Test', lastName: 'Manager' });
        setError('');
      } else {
        setError('Invalid username or password. Please try again.');
        onLogin(false);
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
      onLogin(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-lg border border-white/10">
      <form onSubmit={handleSubmit}>
        <h2 className="font-bold mb-4 text-white flex items-center gap-2">
          <i className="fas fa-user-shield text-purple-400"></i>
          Admin Login
        </h2>
        
        {error && (
          <div className="mb-4 p-3 glass border border-red-500/30 rounded-md">
            <p className="text-red-300 text-sm flex items-center gap-2">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            className="block bg-white/10 border border-white/20 p-3 w-full rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors backdrop-blur-sm"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password"
            className="block bg-white/10 border border-white/20 p-3 w-full rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors backdrop-blur-sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-md font-bold w-full transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover-lift"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Authenticating...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-1"></i>
                Login
              </>
            )}
          </button>
        </div>
        
        <div className="mt-3 text-xs text-gray-400 text-center space-y-1">
          <p className="text-purple-300 font-medium">Demo Credentials:</p>
          <p><span className="text-white">Admin:</span> admin / password</p>
          <p><span className="text-white">Manager:</span> manager / manager123</p>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;
