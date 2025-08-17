// src/app/test-auth/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function TestAuthPage() {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(`Session Error: ${sessionError.message}`);
          setLoading(false);
          return;
        }

        setSession(session);

        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setError(`User Error: ${userError.message}`);
          setLoading(false);
          return;
        }

        setUser(user);
      } catch (err) {
        setError(`Unexpected error: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth event:', _event);
      setSession(session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {session ? JSON.stringify(session, null, 2) : 'No session'}
          </pre>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Status</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {user ? JSON.stringify(user, null, 2) : 'No user'}
          </pre>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Info</h2>
          <ul className="space-y-2">
            <li><strong>Logged In:</strong> {user ? 'Yes' : 'No'}</li>
            <li><strong>Email:</strong> {user?.email || 'N/A'}</li>
            <li><strong>User ID:</strong> {user?.id || 'N/A'}</li>
            <li><strong>Provider:</strong> {user?.app_metadata?.provider || 'N/A'}</li>
          </ul>
        </div>

        <div className="mt-8 flex gap-4">
          <Link 
            href="/welcome"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Welcome Page
          </Link>
          <Link 
            href="/login"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go to Login
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}