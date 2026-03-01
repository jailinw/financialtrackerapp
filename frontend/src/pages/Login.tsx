import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const nav = useNavigate();
  const { setToken } = useAuth();
  const [email, setEmail] = useState('demo@quarterly.app');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await api<{ token: string }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      setToken(result.token);
      nav('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow space-y-3" onSubmit={onSubmit}>
      <h2 className="text-2xl font-semibold">Login</h2>
      <input className="w-full border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="w-full border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button className="w-full bg-indigo-600 text-white p-2 rounded">Login</button>
      <p className="text-sm">Need an account? <Link to="/signup" className="text-indigo-700">Sign up</Link></p>
    </form>
  );
}
