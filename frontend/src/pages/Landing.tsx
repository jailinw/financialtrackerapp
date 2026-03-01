import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Quarterly</h1>
        <p>Invoice + tax estimator for side hustlers.</p>
        <Link className="inline-block bg-indigo-600 text-white px-4 py-2 rounded" to="/login">Start trial</Link>
      </div>
    </div>
  );
}
