import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import type { Metrics } from '../types';

const money = (n: number) => `$${(n / 100).toFixed(2)}`;

export function Dashboard() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    api<Metrics>('/api/metrics?range=mtd', {}, token || undefined).then(setMetrics);
  }, [token]);

  if (!metrics) return <p>Loading dashboard…</p>;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {[['Revenue (MTD)', money(metrics.revenue)], ['Fees (MTD)', money(metrics.fees)], ['Net Profit (MTD)', money(metrics.netProfit)], ['Est. Taxes (QTD)', money(metrics.estimatedTaxesOwed)], ['Save Weekly', money(metrics.suggestedWeeklySavings)], ['Save Monthly', money(metrics.suggestedMonthlySavings)]].map(([label, value]) => (
        <div className="bg-white p-4 rounded shadow" key={label}>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}
