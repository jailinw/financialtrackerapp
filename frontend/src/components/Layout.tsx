import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Layout() {
  const { setToken } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex gap-4 items-center">
          <Link to="/dashboard" className="font-bold">Quarterly</Link>
          <Link to="/transactions">Transactions</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/billing">Billing</Link>
          <Link to="/settings">Settings</Link>
          <button className="ml-auto text-sm text-red-500" onClick={() => setToken(null)}>Logout</button>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
