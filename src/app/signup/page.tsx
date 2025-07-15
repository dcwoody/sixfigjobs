// app/signup/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

   const { error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { name } },
});


    if (authError) {
      setError(authError.message);
    } else {
      const { error: dbError } = await supabase
        .from('Subscribers_DB')
        .insert({
          Email: email,
          Name: name,
          'Subscription Status': 'Subscribed',
          'Timestamp of Last Send': new Date().toISOString().split('T')[0],
          Interests: '',
          'Location or Zip Code': '',
          'Days Since Last Send': 0,
          'Is Subscribed': true,
          'Interest Match Score': 0,
          'Newsletter Content Suggestion': '',
        });

      if (dbError) {
        setError(dbError.message);
      } else {
        setSuccess(true);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-lg">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SixFigHires Logo" width={100} height={50} />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-800">Sign Up</h1>

        {hasMounted && error && (
          <p className="text-red-500 text-center">{error}</p>
        )}

        {hasMounted && success && (
          <p className="text-green-500 text-center">
            Signup successful! Check your email to verify.
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full p-3 bg-blue-900 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
