import React, { useState } from 'react';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Authenticate with proper credentials
    if (username === 'admin' && password === 'password') {
      onLogin(true);
    } else {
      onLogin(false);
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
              className="w-full btn-glass hover:glass-light text-white px-4 py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <i className="fas fa-sign-in-alt"></i>
              <span>Access Admin Panel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
