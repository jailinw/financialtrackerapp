import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

interface Tx {
  id: string;
  occurred_at: string;
  description: string;
  amount_cents: number;
  fee_cents: number;
  net_cents: number;
  category: string;
  tags: string[];
}

export function Transactions() {
  const { token } = useAuth();
  const [items, setItems] = useState<Tx[]>([]);

  const load = () => api<Tx[]>('/api/transactions', {}, token || undefined).then(setItems);
  useEffect(() => { load(); }, [token]);

  const update = async (id: string, patch: Partial<Tx>) => {
    await api(`/api/transactions/${id}`, { method: 'PATCH', body: JSON.stringify({ category: patch.category, tags: patch.tags }) }, token || undefined);
    load();
  };

  return (
    <div className="bg-white rounded shadow overflow-auto">
      <table className="w-full text-sm">
        <thead><tr className="text-left border-b"><th>Date</th><th>Description</th><th>Amount</th><th>Fee</th><th>Net</th><th>Category</th><th>Tags</th></tr></thead>
        <tbody>
          {items.map((tx) => (
            <tr key={tx.id} className="border-b">
              <td>{new Date(tx.occurred_at).toLocaleDateString()}</td>
              <td>{tx.description}</td>
              <td>{(tx.amount_cents / 100).toFixed(2)}</td>
              <td>{(tx.fee_cents / 100).toFixed(2)}</td>
              <td>{(tx.net_cents / 100).toFixed(2)}</td>
              <td><input className="border p-1" defaultValue={tx.category} onBlur={(e) => update(tx.id, { category: e.target.value })} /></td>
              <td><input className="border p-1" defaultValue={tx.tags.join(',')} onBlur={(e) => update(tx.id, { tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
