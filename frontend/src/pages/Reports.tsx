import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function Reports() {
  const { token } = useAuth();
  const open = (path: string) => {
    fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((b) => window.open(URL.createObjectURL(b), '_blank'));
  };

  return (
    <div className="space-y-3">
      <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={() => open('/api/reports/expenses.csv?start=2024-01-01&end=2024-12-31')}>Export expense CSV</button>
      <button className="bg-slate-700 text-white px-4 py-2 rounded ml-2" onClick={() => open('/api/reports/quarterly.pdf?year=2024&quarter=1')}>Generate quarterly PDF</button>
    </div>
  );
}
