import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded check for demonstration. Replace with your real logic.
    if (username === 'admin' && password === 'password') {
      onLogin(true);
    } else {
      onLogin(false);
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4 text-csea-navy">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Username"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-csea-yellow focus:border-csea-yellow transition-colors"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-csea-yellow focus:border-csea-yellow transition-colors"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-csea-navy hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold w-full transition-colors"
        >
          Login
        </button>
      </form>
    </section>
  );
};

export default AdminLogin;
