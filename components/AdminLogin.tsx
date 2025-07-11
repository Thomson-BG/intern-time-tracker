import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
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

    // Simulate authentication check
    try {
      // Simple hardcoded check for demonstration. Replace with your real logic.
      if (username === 'admin' && password === 'password') {
        onLogin(true);
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
    <form onSubmit={handleSubmit} className="mt-6">
      <h2 className="font-bold mb-2 text-gray-900">Admin Login</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Username"
          className="block border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          className="block border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !username || !password}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-md font-bold w-full transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Authenticating...
            </>
          ) : (
            'Login'
          )}
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 text-center">
        <p>Default credentials: admin / password</p>
      </div>
    </form>
  );
};

export default AdminLogin;
