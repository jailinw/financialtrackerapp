import { useEffect, useState } from 'react';
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
  const { token } = useAuth();

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const data = await api<Metrics>(
        '/api/metrics?range=mtd',
        {},
        token
      );

      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, [token]);

  if (!token) {
    return (
      <div className="bg-white p-6 rounded shadow text-center">
        <p className="text-slate-600">You must be logged in to view your dashboard.</p>
      </div>
    );
  }

  if (loading) return <p className="text-slate-500">Loading dashboard…</p>;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
        <p>{error}</p>
        <button
          className="mt-2 text-sm text-indigo-600"
          onClick={loadMetrics}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    ['Revenue (MTD)', money(metrics.revenue)],
    ['Fees (MTD)', money(metrics.fees)],
    ['Net Profit (MTD)', money(metrics.netProfit)],
    ['Est. Taxes (QTD)', money(metrics.estimatedTaxesOwed)],
    ['Save Weekly', money(metrics.suggestedWeeklySavings)],
    ['Save Monthly', money(metrics.suggestedMonthlySavings)],
  ];

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard</h2>

        <button
          onClick={loadMetrics}
          className="text-sm bg-slate-200 px-3 py-1 rounded hover:bg-slate-300"
        >
          Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {cards.map(([label, value]) => (
          <MetricCard key={label} label={label} value={value} />
        ))}
      </div>

    </div>
  );
}