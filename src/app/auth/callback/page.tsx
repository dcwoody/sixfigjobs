// src/app/auth/callback/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processUserProfile = async (user: any, userType: string, isNewsletterSubscriber: boolean) => {
    try {
      // Check if user profile exists in users_db
      console.log('Checking for existing profile...');
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('users_db')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        console.error('Profile check error:', profileCheckError);
      }

      // If no profile exists, create one
      if (!existingProfile) {
        console.log('Creating new user profile...');
        const userProfileData = {
          auth_user_id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || user.user_metadata?.given_name || '',
          last_name: user.user_metadata?.last_name || user.user_metadata?.family_name || '',
          user_type: userType,
          is_newsletter_subscriber: isNewsletterSubscriber,
          is_verified: user.email_confirmed_at ? true : false,
          ...(userType === 'employer' && {
            company_name: '', // Will need to be filled out later
            company_website: '',
            industry: '',
          })
        };

        const { error: profileError } = await supabase
          .from('users_db')
          .insert([userProfileData]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
          setError('Failed to create user profile. Please contact support.');
          setLoading(false);
          return;
        }

        console.log('Profile created successfully!');

        // Create employer profile if needed
        if (userType === 'employer') {
          console.log('Creating employer profile...');
          const { error: employerError } = await supabase
            .from('employer_profiles')
            .insert([{
              user_id: user.id,
              company_description: '',
              subscription_plan: 'free',
              jobs_posted_count: 0,
            }]);

          if (employerError) {
            console.error('Employer profile creation error:', employerError);
            // Don't fail the OAuth flow, but log the error
          }
        }

        // Redirect based on user type
        console.log('Redirecting to dashboard...');
        if (userType === 'employer') {
          router.push('/employer/onboarding');
        } else {
          router.push('/welcome');
        }
      } else {
        console.log('Existing profile found, redirecting...');
        // Profile exists, redirect based on existing user type
        if (existingProfile.user_type === 'employer') {
          router.push('/employer/dashboard');
        } else {
          router.push('/welcome');
        }
      }
    } catch (error) {
      console.error('Profile processing error:', error);
      setError('Failed to process user profile. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Debug: Log what Google sent us
        console.log('=== OAuth Callback Debug ===');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Hash:', window.location.hash);
        
        // Get URL parameters
        const userType = searchParams.get('user_type') || 'job_seeker';
        const newsletterParam = searchParams.get('newsletter');
        const isNewsletterSubscriber = newsletterParam === 'true';
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        
        console.log('OAuth params:', { userType, code: code ? 'present' : 'missing', state, error: errorParam });

        if (errorParam) {
          console.error('OAuth error from Google:', errorParam);
          setError(`OAuth error: ${errorParam}`);
          setLoading(false);
          return;
        }

        if (!code) {
          console.error('No authorization code received from Google');
          setError('No authorization code received from Google. Please try again.');
          setLoading(false);
          return;
        }

        console.log('Setting up auth state listener...');
        
        // Listen for auth state changes - this should trigger when Supabase processes the OAuth callback
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change:', event, session?.user?.email);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in successfully!', session.user.email);
            subscription.unsubscribe(); // Clean up listener
            await processUserProfile(session.user, userType, isNewsletterSubscriber);
          }
        });

        // Also check if there's already a session (in case the callback was processed before the listener was set up)
        console.log('Checking for existing session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
        } else if (session?.user) {
          console.log('Found existing session!', session.user.email);
          subscription.unsubscribe();
          await processUserProfile(session.user, userType, isNewsletterSubscriber);
        } else {
          console.log('No existing session, waiting for auth state change...');
          
          // Set a timeout to show error if nothing happens within 15 seconds
          setTimeout(() => {
            if (loading) {
              subscription.unsubscribe();
              console.error('Timeout waiting for authentication');
              setError('Authentication timed out. Please try logging in again.');
              setLoading(false);
            }
          }, 15000);
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, searchParams, loading]);

  // Handle error parameter from URL
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'auth_failed':
          setError('Authentication failed. Please try again.');
          break;
        case 'callback_failed':
          setError('Callback processing failed. Please try again.');
          break;
        case 'no_code':
          setError('No authorization code received. Please try again.');
          break;
        default:
          setError('An authentication error occurred. Please try again.');
      }
      setLoading(false);
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-4">
          <svg
            className="animate-spin mx-auto h-12 w-12 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing sign in...</h2>
        <p className="text-gray-600">Please wait while we set up your account.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="animate-spin mx-auto h-12 w-12 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Setting up your authentication...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}