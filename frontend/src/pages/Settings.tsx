import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types';

export function Settings() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    api<UserProfile>('/api/me', {}, token || undefined).then(setProfile);
  }, [token]);

  const connect = async () => {
    const data = await api<{ url: string }>('/api/stripe/connect-url', {}, token || undefined);
    window.location.href = data.url;
  };

  const sync = async () => {
    await api('/api/sync/stripe', { method: 'POST' }, token || undefined);
    alert('Sync complete');
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-xl space-y-3">
      <h2 className="text-xl font-semibold">Stripe Connection</h2>
      <p>Connected: {profile?.stripeConnected ? 'Yes' : 'No'}</p>
      <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={connect}>Connect Stripe</button>
      <button className="bg-slate-700 text-white px-4 py-2 rounded ml-2" onClick={sync}>Sync last 90 days</button>
    </div>
  );
}
