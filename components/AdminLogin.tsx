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
    <form onSubmit={handleSubmit} className="mt-6">
      <h2 className="font-bold mb-2">Admin Login</h2>
      <input
        type="text"
        placeholder="Username"
        className="block border p-2 mb-2 w-full rounded"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="block border p-2 mb-2 w-full rounded"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded font-bold w-full"
      >
        Login
      </button>
    </form>
  );
};

export default AdminLogin;
