'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign in to SixFigHires</h1>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-100 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path
              fill="#EA4335"
              d="M24 9.5c3.6 0 6.6 1.5 8.7 3.8l6.5-6.5C35.3 2.7 30.1 0 24 0 14.9 0 6.9 5.8 3.1 14.1l7.7 6c1.5-5.3 6.3-9.1 13.2-9.1z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.1 0 11.3-2 15.1-5.5l-7.2-5.9c-2 1.3-4.6 2.1-7.9 2.1-6.7 0-12.4-4.5-14.5-10.7l-7.6 6c3.7 8.3 11.7 14 21.1 14z"
            />
            <path
              fill="#4A90E2"
              d="M46.5 24.5c0-1.6-.1-2.8-.3-4H24v7.5h12.7c-.5 3.3-2.4 6.1-5.1 8l7.1 5.9c4.1-3.8 6.8-9.4 6.8-17.4z"
            />
            <path
              fill="#FBBC05"
              d="M9.5 28.6c-.5-1.5-.8-3.1-.8-4.6s.3-3.2.8-4.6l-7.6-6C.6 16.1 0 19 0 24s.6 7.9 1.9 11.6l7.6-6z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </main>
  );
}
