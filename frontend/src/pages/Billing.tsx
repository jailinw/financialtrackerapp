import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { UserProfile } from '../types';

export function Billing() {
  const { token } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectingTo, setRedirectingTo] = useState<'checkout' | 'portal' | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!token) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        setError(null);

        const data = await api<UserProfile>('/api/me', {}, token);
        if (!cancelled) {
          setProfile(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load billing profile');
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const go = async (kind: 'checkout' | 'portal') => {
    try {
      setError(null);
      setRedirectingTo(kind);

      const result = await api<{ url: string }>(
        `/api/billing/${kind}`,
        { method: 'POST' },
        token || undefined
      );

      window.location.href = result.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to open ${kind}`);
      setRedirectingTo(null);
    }
  };

  const subscriptionStatus = profile?.subscriptionStatus ?? 'inactive';

  const statusClasses =
    subscriptionStatus === 'active'
      ? 'bg-green-100 text-green-700'
      : subscriptionStatus === 'trialing'
      ? 'bg-yellow-100 text-yellow-700'
      : subscriptionStatus === 'past_due'
      ? 'bg-red-100 text-red-700'
      : 'bg-slate-100 text-slate-700';

  return (
    <div className="max-w-xl rounded shadow bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Billing</h2>
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClasses}`}>
          {loadingProfile ? 'Loading...' : subscriptionStatus}
        </span>
      </div>

      <p className="text-sm text-slate-600">
        Manage your plan, start a subscription, or update payment details.
      </p>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded bg-indigo-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => go('checkout')}
          disabled={!token || redirectingTo !== null}
        >
          {redirectingTo === 'checkout' ? 'Redirecting...' : 'Subscribe ($19/mo)'}
        </button>

        <button
          className="rounded bg-slate-700 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => go('portal')}
          disabled={!token || redirectingTo !== null}
        >
          {redirectingTo === 'portal' ? 'Opening portal...' : 'Manage billing'}
        </button>
      </div>

      {!token && (
        <p className="text-sm text-amber-600">
          You need to be logged in to manage billing.
        </p>
      )}
    </div>
  );
}