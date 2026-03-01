import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export function Signup() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await api('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) });
    nav('/login');
  };

  return (
    <form className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow space-y-3" onSubmit={onSubmit}>
      <h2 className="text-2xl font-semibold">Sign up</h2>
      <input className="w-full border p-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="w-full border p-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button className="w-full bg-indigo-600 text-white p-2 rounded">Create account</button>
    </form>
  );
}
