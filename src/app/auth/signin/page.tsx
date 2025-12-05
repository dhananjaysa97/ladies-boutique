'use client';

import { FormEvent, useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

function SignInInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/products';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError('Invalid credentials');
      setLoading(false);
    } else if (res?.ok) {
      window.location.href = callbackUrl;
    } else {
      setError('Unexpected error');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Admin Sign In</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="space-y-3 bg-white/80 backdrop-blur rounded-2xl p-4 shadow-sm border border-white/70"
        aria-label="Admin sign in form"
      >
        <div>
          <label className="block text-xs mb-1" htmlFor="admin-email">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label className="block text-xs mb-1" htmlFor="admin-password">
            Password
          </label>
          <input
            id="admin-password"
            type="password"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 disabled:opacity-60 text-sm"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<p className="text-sm text-gray-600">Loading sign-in…</p>}>
      <SignInInner />
    </Suspense>
  );
}