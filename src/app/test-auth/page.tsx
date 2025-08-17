// src/app/test-auth/page.tsx - Fixed TypeScript errors
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

// Define types locally to avoid import issues
interface Session {
  user: {
    id: string;
    email?: string;
    user_metadata?: any;
  };
  access_token?: string;
  refresh_token?: string;
}

type AuthChangeEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | 'PASSWORD_RECOVERY';

interface AuthState {
  session: Session | null;
  loading: boolean;
  user: any;
}

export default function TestAuthPage() {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    loading: true,
    user: null
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setAuthState(prev => ({
        ...prev,
        session: session,
        user: session?.user || null,
        loading: false
      }));
    };

    getSession();

    // Listen for auth changes with proper types
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', _event, session?.user?.email);
        setAuthState(prev => ({
          ...prev,
          session: session,
          user: session?.user || null,
          loading: false
        }));
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/test-auth`
        }
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else if (data.user) {
        setMessage('Success! Check your email for verification link.');
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
      } else if (data.user) {
        setMessage('Successfully signed in!');
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setMessage(`Error signing out: ${error.message}`);
      } else {
        setMessage('Successfully signed out!');
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('users_db')
        .select('count')
        .limit(1);

      if (error) {
        setMessage(`Database Error: ${error.message}`);
      } else {
        setMessage('✅ Database connection successful!');
      }
    } catch (error) {
      setMessage(`Database connection failed: ${error}`);
    }
  };

  if (authState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading auth state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Authentication Test Page
        </h1>

        {/* Status Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') || message.includes('failed') 
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            <p>{message}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Current Auth State */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
            
            {authState.session ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Authenticated</p>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>User ID:</strong> {authState.user?.id}</p>
                  <p><strong>Email:</strong> {authState.user?.email}</p>
                  <p><strong>Email Verified:</strong> {authState.user?.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Last Sign In:</strong> {authState.user?.last_sign_in_at ? new Date(authState.user.last_sign_in_at).toLocaleString() : 'Never'}</p>
                </div>

                <button
                  onClick={handleSignOut}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Signing Out...' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">❌ Not authenticated</p>
                </div>
                <p className="text-sm text-gray-600">Use the forms below to sign in or sign up.</p>
              </div>
            )}
          </div>

          {/* Auth Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Actions</h2>
            
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Database Test */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Database Connection Test</h2>
          <p className="text-gray-600 mb-4">
            Test if the app can connect to your Supabase database.
          </p>
          <button
            onClick={testDatabaseConnection}
            className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Test Database Connection
          </button>
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <pre className="whitespace-pre-wrap text-gray-700">
              {JSON.stringify({
                hasSession: !!authState.session,
                userId: authState.user?.id || null,
                userEmail: authState.user?.email || null,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}