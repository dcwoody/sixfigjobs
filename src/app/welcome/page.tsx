// src/app/welcome/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Session } from '@supabase/supabase-js';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function WelcomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push('/login');
      } else {
        setSession(data.session);
        setLoading(false);
      }
    };
    getSession();
  }, [router]);

  if (loading || !session) {
    return <div className="min-h-screen bg-gray-50">Loading...</div>;
  }

  const user = session.user;
  const email = user?.email || 'User';

  return (
    <>
      <Hero />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb Navigation */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-blue-600 transition-colors">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium truncate max-w-xs">
                  Welcome
                </span>
              </li>
            </ol>
          </nav>

          {/* Welcome Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {email}!</h1>
            <p className="text-gray-600 text-lg">We're glad you're here. You can manage your preferences, view saved jobs, and explore new opportunities below.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Saved Jobs */}
            <Link
              href="/saved"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Saved Jobs</h2>
              <p className="text-gray-600 text-sm">Access all jobs you've bookmarked and want to revisit later.</p>
            </Link>

            {/* Card 2: Preferences */}
            <Link
              href="/preferences"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Job Preferences</h2>
              <p className="text-gray-600 text-sm">Set your desired roles, salary expectations, and job types.</p>
            </Link>

            {/* Card 3: Account Settings */}
            <Link
              href="/settings"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Account Settings</h2>
              <p className="text-gray-600 text-sm">Update your email, password, or other profile details.</p>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
