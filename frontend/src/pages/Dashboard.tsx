import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { Metrics } from '../types';

const money = (n: number) => `$${(n / 100).toFixed(2)}`;

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded shadow hover:shadow-md transition">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function Dashboard() {
  const { token, isAuthenticated } = useAuth();

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'mtd' | 'qtd'>('mtd');
  const [refreshTick, setRefreshTick] = useState(0);

  const mountedRef = useRef(true);
  const lastTokenRef = useRef<string | null>(token);

  const cards = useMemo(() => {
    if (!metrics) return [];

    return [
      ['Revenue (MTD)', money(metrics.revenue)],
      ['Fees (MTD)', money(metrics.fees)],
      ['Net Profit (MTD)', money(metrics.netProfit)],
      ['Est. Taxes (QTD)', money(metrics.estimatedTaxesOwed)],
      ['Save Weekly', money(metrics.suggestedWeeklySavings)],
      ['Save Monthly', money(metrics.suggestedMonthlySavings)],
    ];
  }, [metrics, range]);

  const loadMetrics = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const authToken = lastTokenRef.current || token || undefined;

      const data = await api<Metrics>(
        `/api/metrics?range=${range}`,
        {
          headers: {
            'x-dashboard-refresh': String(Date.now()),
          },
        },
        authToken
      );

      if (!mountedRef.current) return;

      setMetrics((prev) => ({
        ...prev,
        ...data,
      }) as Metrics);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    lastTokenRef.current = token;
    loadMetrics();

    return () => {
      mountedRef.current = false;
    };
  }, [refreshTick]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError(null);
    }
  }, [token]);

  if (!token) {
    return (
      <div className="bg-white p-6 rounded shadow text-center">
        <p className="text-slate-600">You must be logged in to view your dashboard.</p>
      </div>
    );
  }

  if (loading && !metrics) {
    return <p className="text-slate-500">Loading dashboard…</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Dashboard</h2>

        <div className="flex items-center gap-2">
          <select
            className="border rounded px-2 py-1 text-sm"
            value={range}
            onChange={(e) => setRange(e.target.value as 'mtd' | 'qtd')}
          >
            <option value="mtd">Month to date</option>
            <option value="qtd">Quarter to date</option>
          </select>

          <button
            onClick={() => setRefreshTick((v) => v + 1)}
            className="text-sm bg-slate-200 px-3 py-1 rounded hover:bg-slate-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      )}

      {!cards.length ? (
        <p className="text-slate-500">No dashboard data available.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {cards.map(([label, value]) => (
            <MetricCard key={label} label={label} value={value} />
          ))}
        </div>
      )}
    </div>
  );
}