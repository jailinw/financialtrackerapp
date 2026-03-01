import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types';

export function Billing() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    api<UserProfile>('/api/me', {}, token || undefined).then(setProfile);
  }, [token]);

  const go = async (kind: 'checkout' | 'portal') => {
    const result = await api<{ url: string }>(`/api/billing/${kind}`, { method: 'POST' }, token || undefined);
    window.location.href = result.url;
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded shadow max-w-xl">
      <h2 className="text-xl font-semibold">Billing</h2>
      <p>Status: <strong>{profile?.subscriptionStatus ?? 'loading'}</strong></p>
      <div className="space-x-2">
        <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={() => go('checkout')}>Subscribe ($19/mo)</button>
        <button className="bg-slate-700 text-white px-4 py-2 rounded" onClick={() => go('portal')}>Manage billing</button>
      </div>
    </div>
  );
}
