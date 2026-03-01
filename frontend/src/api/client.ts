const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  if (res.headers.get('Content-Type')?.includes('application/json')) {
    return (await res.json()) as T;
  }

  return undefined as T;
}
